import { NextResponse } from 'next/server';
import { obtenerMetricasDashboard } from '@/lib/inventory';
import { JwtPayload } from '@/lib/auth';
import { puedeVerCostos } from '@/middleware/checkRole';
import { prisma } from '@/lib/prisma';

export async function obtenerDashboard({ user }: { user: JwtPayload }): Promise<NextResponse> {
  const [metricas, solicitudesPendientes, movimientosHoy] = await Promise.all([
    obtenerMetricasDashboard(),
    prisma.solicitudReposicion.count({ where: { estado: 'pendiente' } }),
    prisma.movimiento.count({
      where: {
        fecha: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        usuarioId: parseInt(user.sub, 10),
      },
    }),
  ]);

  const base = {
    totalInsumos: metricas.totalInsumos,
    alertasStock: metricas.alertasStock,
    productosPorVencer: metricas.productosPorVencer,
    solicitudesPendientes,
    misMovimientosHoy: movimientosHoy,
    valorTotalInventario: puedeVerCostos(user) ? metricas.valorTotalInventario : null,
  };

  return NextResponse.json(base);
}
