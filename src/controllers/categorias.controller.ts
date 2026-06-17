import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

const schema = z.object({
  nombre: z.string().min(2).max(100),
  descripcion: z.string().optional(),
});

export async function listarCategorias(): Promise<NextResponse> {
  const categorias = await prisma.categoria.findMany({
    include: { _count: { select: { productos: true } } },
    orderBy: { nombre: 'asc' },
  });
  return NextResponse.json({ data: categorias });
}

export async function crearCategoria(req: NextRequest): Promise<NextResponse> {
  const parsed = schema.parse(await req.json());
  const cat = await prisma.categoria.create({ data: parsed });
  return NextResponse.json({ data: cat }, { status: 201 });
}

export async function actualizarCategoria(
  req: NextRequest,
  { params }: { params?: Record<string, string> }
): Promise<NextResponse> {
  const id = parseInt(params?.id ?? '0', 10);
  const parsed = schema.partial().parse(await req.json());
  const cat = await prisma.categoria.update({ where: { id }, data: parsed });
  return NextResponse.json({ data: cat });
}

export async function eliminarCategoria(
  _req: NextRequest,
  { params }: { params?: Record<string, string> }
): Promise<NextResponse> {
  const id = parseInt(params?.id ?? '0', 10);
  const count = await prisma.producto.count({ where: { categoriaId: id, activo: true } });
  if (count > 0) {
    return NextResponse.json({ error: 'La categoría tiene productos activos.' }, { status: 400 });
  }
  await prisma.categoria.delete({ where: { id } });
  return NextResponse.json({ message: 'Eliminada' });
}
