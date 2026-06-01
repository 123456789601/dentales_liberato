import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/** Feed de actividad reciente para el dashboard */
export async function actividadReciente(): Promise<NextResponse> {
  const [movimientos, solicitudes, auditoria] = await Promise.all([
    prisma.movimiento.findMany({
      take: 8,
      orderBy: { fecha: 'desc' },
      include: {
        producto: { select: { nombre: true, skuCode: true } },
        usuario: { select: { nombre: true } },
      },
    }),
    prisma.solicitudReposicion.findMany({
      where: { estado: 'pendiente' },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { producto: { select: { nombre: true } }, usuario: { select: { nombre: true } } },
    }),
    prisma.auditoria.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { usuario: { select: { nombre: true } } },
    }),
  ]);

  return NextResponse.json({ movimientos, solicitudes, auditoria });
}
