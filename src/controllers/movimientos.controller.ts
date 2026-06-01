import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { TipoMovimiento } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { JwtPayload, tienePermisoEnSesion } from '@/lib/auth';
import { PERMISOS } from '@/lib/permissions';
import { registrarAuditoria } from '@/lib/auditoria';

const movimientoSchema = z.object({
  productoId: z.number().int().positive(),
  tipo: z.enum(['Entrada', 'Salida', 'Ajuste']),
  cantidad: z.number().int().positive(),
  motivo: z.string().min(3).max(255),
  referencia: z.string().optional(),
  pacienteRef: z.string().optional(),
});

const PERMISO_POR_TIPO: Record<string, string> = {
  Entrada: PERMISOS.MOVIMIENTOS_ENTRADA,
  Salida: PERMISOS.MOVIMIENTOS_SALIDA,
  Ajuste: PERMISOS.MOVIMIENTOS_AJUSTE,
};

export async function crearMovimiento(req: NextRequest, { user }: { user: JwtPayload }): Promise<NextResponse> {
  const data = movimientoSchema.parse(await req.json());
  const permisoReq = PERMISO_POR_TIPO[data.tipo];
  if (!permisoReq || !tienePermisoEnSesion(user, permisoReq)) {
    return NextResponse.json({ error: `Sin permiso para movimiento tipo ${data.tipo}.` }, { status: 403 });
  }

  try {
    const resultado = await prisma.$transaction(async (tx) => {
      const producto = await tx.producto.findUnique({ where: { id: data.productoId, activo: true } });
      if (!producto) throw new Error('PRODUCTO_NO_ENCONTRADO');

      let delta = data.cantidad;
      if (data.tipo === 'Salida') delta = -data.cantidad;
      if (data.tipo === 'Ajuste') {
        delta = data.cantidad - producto.stockActual;
      }

      const nuevoStock = producto.stockActual + delta;
      if (nuevoStock < 0) throw new Error('STOCK_INSUFICIENTE');

      const movimiento = await tx.movimiento.create({
        data: {
          productoId: data.productoId,
          usuarioId: parseInt(user.sub, 10),
          tipo: data.tipo as TipoMovimiento,
          cantidad: data.tipo === 'Ajuste' ? Math.abs(delta) : data.cantidad,
          stockAnterior: producto.stockActual,
          stockPosterior: nuevoStock,
          motivo: data.motivo,
          referencia: data.referencia,
          pacienteRef: data.pacienteRef,
        },
        include: {
          producto: { include: { categoria: true } },
          usuario: { select: { id: true, nombre: true, email: true } },
        },
      });

      await tx.producto.update({ where: { id: data.productoId }, data: { stockActual: nuevoStock } });
      return movimiento;
    });

    await registrarAuditoria({
      usuarioId: parseInt(user.sub, 10),
      accion: `movimiento.${data.tipo.toLowerCase()}`,
      entidad: 'movimientos',
      entidadId: resultado.id,
      detalle: `${data.tipo} x${data.cantidad} producto ${data.productoId}`,
    });

    return NextResponse.json({ data: resultado }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : '';
    if (msg === 'PRODUCTO_NO_ENCONTRADO') return NextResponse.json({ error: 'Producto no encontrado.' }, { status: 404 });
    if (msg === 'STOCK_INSUFICIENTE') return NextResponse.json({ error: 'Stock insuficiente.' }, { status: 400 });
    throw err;
  }
}

export async function listarMovimientos(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, parseInt(searchParams.get('limit') ?? '25', 10));
  const productoId = searchParams.get('productoId');
  const tipo = searchParams.get('tipo');
  const desde = searchParams.get('desde');
  const hasta = searchParams.get('hasta');

  const where: Record<string, unknown> = {};
  if (productoId) where.productoId = parseInt(productoId, 10);
  if (tipo) where.tipo = tipo;
  if (desde || hasta) {
    where.fecha = {};
    if (desde) (where.fecha as Record<string, Date>).gte = new Date(desde);
    if (hasta) (where.fecha as Record<string, Date>).lte = new Date(hasta + 'T23:59:59');
  }

  const [movimientos, total] = await Promise.all([
    prisma.movimiento.findMany({
      where,
      include: {
        producto: { select: { id: true, nombre: true, skuCode: true, ubicacionBodega: true } },
        usuario: { select: { id: true, nombre: true, email: true } },
      },
      orderBy: { fecha: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.movimiento.count({ where }),
  ]);

  return NextResponse.json({
    data: movimientos,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function obtenerKardex(
  _req: NextRequest,
  { params }: { user: JwtPayload; params?: Record<string, string> }
): Promise<NextResponse> {
  const productoId = parseInt(params?.id ?? '0', 10);
  const producto = await prisma.producto.findUnique({
    where: { id: productoId },
    include: { categoria: true },
  });
  if (!producto) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });

  const movimientos = await prisma.movimiento.findMany({
    where: { productoId },
    include: { usuario: { select: { nombre: true } } },
    orderBy: { fecha: 'desc' },
    take: 200,
  });

  return NextResponse.json({ producto, movimientos });
}

export async function resumenConsumo(req: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const dias = parseInt(searchParams.get('dias') ?? '30', 10);
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);

  const salidas = await prisma.movimiento.groupBy({
    by: ['productoId'],
    where: { tipo: 'Salida', fecha: { gte: desde } },
    _sum: { cantidad: true },
    orderBy: { _sum: { cantidad: 'desc' } },
    take: 20,
  });

  const productos = await prisma.producto.findMany({
    where: { id: { in: salidas.map((s) => s.productoId) } },
    select: { id: true, nombre: true, skuCode: true },
  });

  const mapa = Object.fromEntries(productos.map((p) => [p.id, p]));
  const data = salidas.map((s) => ({
    producto: mapa[s.productoId],
    totalConsumido: s._sum.cantidad ?? 0,
  }));

  return NextResponse.json({ dias, data });
}
