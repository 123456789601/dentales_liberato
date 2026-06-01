import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { enriquecerProductos, calcularValorTotalInventario } from '@/lib/inventory';

function csvEscape(val: string | number | null | undefined): string {
  const s = String(val ?? '');
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

export async function exportarInventarioCsv(): Promise<NextResponse> {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    include: { categoria: true, proveedor: true },
  });
  const data = enriquecerProductos(productos);
  const valorTotal = await calcularValorTotalInventario();

  const headers = ['SKU', 'Nombre', 'Categoría', 'Stock', 'Mínimo', 'Precio', 'Vencimiento', 'Ubicación', 'Estado', 'Valor Bodega'];
  const rows = data.map((p) => [
    p.skuCode,
    p.nombre,
    p.categoria.nombre,
    p.stockActual,
    p.stockMinimo,
    p.precioUnitario,
    p.fechaVencimiento ? new Date(p.fechaVencimiento).toISOString().slice(0, 10) : '',
    p.ubicacionBodega ?? '',
    p.semaforo,
    p.valorEnBodega,
  ]);

  const csv = [
    `# Dentales Liberato - Inventario - ${new Date().toISOString()}`,
    `# Valor total: ${valorTotal}`,
    headers.join(','),
    ...rows.map((r) => r.map(csvEscape).join(',')),
  ].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="inventario-dentales-liberato-${Date.now()}.csv"`,
    },
  });
}

export async function exportarMovimientosCsv(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const dias = parseInt(searchParams.get('dias') ?? '30', 10);
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);

  const movimientos = await prisma.movimiento.findMany({
    where: { fecha: { gte: desde } },
    include: {
      producto: { select: { skuCode: true, nombre: true } },
      usuario: { select: { nombre: true, email: true } },
    },
    orderBy: { fecha: 'desc' },
  });

  const headers = ['Fecha', 'Tipo', 'SKU', 'Producto', 'Cantidad', 'Stock Ant.', 'Stock Post.', 'Motivo', 'Paciente', 'Usuario'];
  const rows = movimientos.map((m) => [
    m.fecha.toISOString(),
    m.tipo,
    m.producto.skuCode,
    m.producto.nombre,
    m.cantidad,
    m.stockAnterior,
    m.stockPosterior,
    m.motivo,
    m.pacienteRef ?? '',
    m.usuario.nombre,
  ]);

  const csv = [headers.join(','), ...rows.map((r) => r.map(csvEscape).join(','))].join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="movimientos-dentales-liberato-${Date.now()}.csv"`,
    },
  });
}

export async function resumenInventario(): Promise<NextResponse> {
  const [totalProductos, valorTotal, movimientosMes, solicitudesPendientes] = await Promise.all([
    prisma.producto.count({ where: { activo: true } }),
    calcularValorTotalInventario(),
    prisma.movimiento.count({
      where: { fecha: { gte: new Date(new Date().setDate(1)) } },
    }),
    prisma.solicitudReposicion.count({ where: { estado: 'pendiente' } }),
  ]);

  return NextResponse.json({
    totalProductos,
    valorTotal,
    movimientosMes,
    solicitudesPendientes,
  });
}
