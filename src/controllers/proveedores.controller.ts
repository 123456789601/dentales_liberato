import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  nombre: z.string().min(2).max(150),
  contacto: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  activo: z.boolean().optional(),
});

export async function listarProveedores(): Promise<NextResponse> {
  const data = await prisma.proveedor.findMany({
    include: { _count: { select: { productos: true, ordenesCompra: true } } },
    orderBy: { nombre: 'asc' },
  });
  return NextResponse.json({ data });
}

export async function crearProveedor(req: NextRequest): Promise<NextResponse> {
  const parsed = schema.parse(await req.json());
  const p = await prisma.proveedor.create({
    data: { ...parsed, email: parsed.email || null },
  });
  return NextResponse.json({ data: p }, { status: 201 });
}

export async function actualizarProveedor(
  req: NextRequest,
  { params }: { params?: Record<string, string> }
): Promise<NextResponse> {
  const id = parseInt(params?.id ?? '0', 10);
  const parsed = schema.partial().parse(await req.json());
  const p = await prisma.proveedor.update({
    where: { id },
    data: { ...parsed, email: parsed.email === '' ? null : parsed.email },
  });
  return NextResponse.json({ data: p });
}
