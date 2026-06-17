import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enriquecerProductos } from '@/lib/inventory';

export async function busquedaGlobal(req: NextRequest): Promise<NextResponse> {
  const q = new URL(req.url).searchParams.get('q')?.trim() ?? '';
  if (q.length < 2) return NextResponse.json({ productos: [], movimientos: [] });

  const [productos, movimientos] = await Promise.all([
    prisma.producto.findMany({
      where: {
        activo: true,
        OR: [
          { nombre: { contains: q } },
          { skuCode: { contains: q } },
          { descripcion: { contains: q } },
        ],
      },
      include: { categoria: true },
      take: 10,
    }),
    prisma.movimiento.findMany({
      where: {
        OR: [
          { motivo: { contains: q } },
          { referencia: { contains: q } },
          { pacienteRef: { contains: q } },
          { producto: { nombre: { contains: q } } },
          { producto: { skuCode: { contains: q } } },
        ],
      },
      include: { producto: { select: { id: true, nombre: true, skuCode: true } } },
      take: 5,
      orderBy: { fecha: 'desc' },
    }),
  ]);

  return NextResponse.json({
    productos: enriquecerProductos(productos),
    movimientos,
  });
}
