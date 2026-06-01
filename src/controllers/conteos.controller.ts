import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { JwtPayload } from '@/lib/auth';
import { registrarAuditoria } from '@/lib/auditoria';
import { TipoMovimiento } from '@prisma/client';

export async function listarConteos(): Promise<NextResponse> {
  const conteos = await prisma.conteoInventario.findMany({
    include: {
      usuario: { select: { nombre: true } },
      _count: { select: { detalles: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json({ data: conteos });
}

export async function crearConteo(req: NextRequest, { user }: { user: JwtPayload }): Promise<NextResponse> {
  const body = z.object({ notas: z.string().optional() }).parse(await req.json());

  const productos = await prisma.producto.findMany({ where: { activo: true }, select: { id: true, stockActual: true } });

  const conteo = await prisma.$transaction(async (tx) => {
    const c = await tx.conteoInventario.create({
      data: { usuarioId: parseInt(user.sub, 10), notas: body.notas },
    });
    await tx.conteoDetalle.createMany({
      data: productos.map((p) => ({
        conteoId: c.id,
        productoId: p.id,
        stockSistema: p.stockActual,
      })),
    });
    return c;
  });

  await registrarAuditoria({
    usuarioId: parseInt(user.sub, 10),
    accion: 'conteo.crear',
    entidad: 'conteos',
    entidadId: conteo.id,
  });

  return NextResponse.json({ data: conteo }, { status: 201 });
}

export async function obtenerConteo(
  _req: NextRequest,
  { params }: { params?: Record<string, string> }
): Promise<NextResponse> {
  const id = parseInt(params?.id ?? '0', 10);
  const conteo = await prisma.conteoInventario.findUnique({
    where: { id },
    include: {
      detalles: { include: { producto: { include: { categoria: true } } }, orderBy: { id: 'asc' } },
      usuario: { select: { nombre: true } },
    },
  });
  if (!conteo) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  return NextResponse.json({ data: conteo });
}

const detalleSchema = z.object({
  productoId: z.number().int().positive(),
  stockFisico: z.number().int().min(0),
});

export async function registrarConteoFisico(
  req: NextRequest,
  { params }: { params?: Record<string, string> }
): Promise<NextResponse> {
  const conteoId = parseInt(params?.id ?? '0', 10);
  const { productoId, stockFisico } = detalleSchema.parse(await req.json());

  const detalle = await prisma.conteoDetalle.findUnique({
    where: { conteoId_productoId: { conteoId, productoId } },
  });
  if (!detalle) return NextResponse.json({ error: 'Producto no en conteo' }, { status: 404 });

  const diferencia = stockFisico - detalle.stockSistema;
  const updated = await prisma.conteoDetalle.update({
    where: { id: detalle.id },
    data: { stockFisico, diferencia },
    include: { producto: true },
  });

  return NextResponse.json({ data: updated });
}

/** Cierra conteo y aplica ajustes automáticos donde hay diferencia */
export async function cerrarConteo(
  req: NextRequest,
  { user, params }: { user: JwtPayload; params?: Record<string, string> }
): Promise<NextResponse> {
  const conteoId = parseInt(params?.id ?? '0', 10);
  const aplicarAjustes = z.object({ aplicarAjustes: z.boolean().default(true) }).parse(await req.json());

  const conteo = await prisma.conteoInventario.findUnique({
    where: { id: conteoId, estado: 'en_progreso' },
    include: { detalles: true },
  });
  if (!conteo) return NextResponse.json({ error: 'Conteo no encontrado o ya cerrado' }, { status: 400 });

  const pendientes = conteo.detalles.filter((d) => d.stockFisico === null);
  if (pendientes.length > 0) {
    return NextResponse.json({
      error: `Faltan ${pendientes.length} productos por contar`,
      pendientes: pendientes.length,
    }, { status: 400 });
  }

  await prisma.$transaction(async (tx) => {
    if (aplicarAjustes) {
      for (const d of conteo.detalles) {
        if (d.diferencia === 0 || d.ajustado || d.stockFisico === null) continue;

        const producto = await tx.producto.findUnique({ where: { id: d.productoId } });
        if (!producto) continue;

        await tx.movimiento.create({
          data: {
            productoId: d.productoId,
            usuarioId: parseInt(user.sub, 10),
            tipo: TipoMovimiento.Ajuste,
            cantidad: Math.abs(d.diferencia ?? 0),
            stockAnterior: producto.stockActual,
            stockPosterior: d.stockFisico,
            motivo: `Ajuste por conteo físico #${conteoId}`,
            referencia: `CONTEO-${conteoId}`,
          },
        });

        await tx.producto.update({ where: { id: d.productoId }, data: { stockActual: d.stockFisico } });
        await tx.conteoDetalle.update({ where: { id: d.id }, data: { ajustado: true } });
      }
    }

    await tx.conteoInventario.update({
      where: { id: conteoId },
      data: { estado: 'completado', completedAt: new Date() },
    });
  });

  return NextResponse.json({ message: 'Conteo completado', aplicarAjustes });
}
