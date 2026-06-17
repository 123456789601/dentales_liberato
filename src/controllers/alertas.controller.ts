import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enriquecerProductos } from '@/lib/inventory';

export async function listarAlertas(): Promise<NextResponse> {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    include: { categoria: true, proveedor: true },
    orderBy: { nombre: 'asc' },
  });

  const enriquecidos = enriquecerProductos(productos);
  const criticos = enriquecidos.filter((p) => p.semaforo === 'rojo');
  const porVencer = enriquecidos.filter((p) => p.semaforo === 'amarillo');
  const optimos = enriquecidos.filter((p) => p.semaforo === 'verde');

  return NextResponse.json({
    resumen: {
      total: enriquecidos.length,
      criticos: criticos.length,
      porVencer: porVencer.length,
      optimos: optimos.length,
    },
    criticos,
    porVencer,
  });
}
