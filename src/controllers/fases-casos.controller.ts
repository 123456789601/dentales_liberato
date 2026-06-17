import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const faseSchema = z.object({
  nombre: z.string().min(1).max(100),
  descripcion: z.string().optional(),
  color: z.string().optional(),
  orden: z.number().int().min(0).optional(),
});

export async function listarFasesCasos(): Promise<NextResponse> {
  const fases = await prisma.faseCaso.findMany({
    orderBy: { orden: 'asc' },
  });

  return NextResponse.json(fases);
}

export async function crearFaseCaso(req: NextRequest): Promise<NextResponse> {
  const data = faseSchema.parse(await req.json());

  const fase = await prisma.faseCaso.create({
    data,
  });

  return NextResponse.json(fase, { status: 201 });
}

export async function obtenerFaseCaso(id: number): Promise<NextResponse> {
  const fase = await prisma.faseCaso.findUnique({
    where: { id },
  });

  if (!fase) {
    return NextResponse.json({ error: 'Fase no encontrada' }, { status: 404 });
  }

  return NextResponse.json(fase);
}

export async function actualizarFaseCaso(
  req: NextRequest,
  { params }: { params?: Record<string, string> }
): Promise<NextResponse> {
  const faseId = parseInt(params?.id ?? '0', 10);
  const data = faseSchema.parse(await req.json());

  const fase = await prisma.faseCaso.update({
    where: { id: faseId },
    data,
  });

  return NextResponse.json(fase);
}

export async function eliminarFaseCaso(
  req: NextRequest,
  { params }: { params?: Record<string, string> }
): Promise<NextResponse> {
  const faseId = parseInt(params?.id ?? '0', 10);

  await prisma.faseCaso.delete({
    where: { id: faseId },
  });

  return NextResponse.json({ success: true });
}
