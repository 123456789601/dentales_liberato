import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { JwtPayload } from '@/lib/auth';
import { registrarAuditoria } from '@/lib/auditoria';
import { TipoMovimiento } from '@prisma/client';

function generarNumeroOrden(): string {
  const fecha = new Date();
  const y = fecha.getFullYear().toString().slice(-2);
  const m = String(fecha.getMonth() + 1).padStart(2, '0');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `OC-${y}${m}-${rand}`;
}

const detalleItem = z.object({
  productoId: z.number().int().positive(),
  cantidad: z.number().int().positive(),
  precioUnitario: z.number().min(0),
});

const crearSchema = z.object({
  proveedorId: z.number().int().positive(),
  notas: z.string().optional(),
  detalles: z.array(detalleItem).min(1),
});

export async function listarOrdenes(req: NextRequest): Promise<NextResponse> {
  const estado = new URL(req.url).searchParams.get('estado');
  const ordenes = await prisma.ordenCompra.findMany({
    where: estado ? { estado: estado as 'borrador' | 'enviada' | 'recibida' | 'cancelada' } : {},
    include: {
      proveedor: true,
      usuario: { select: { nombre: true } },
      _count: { select: { detalles: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
  return NextResponse.json({ data: ordenes });
}

export async function crearOrden(req: NextRequest, { user }: { user: JwtPayload }): Promise<NextResponse> {
  const parsed = crearSchema.parse(await req.json());
  const total = parsed.detalles.reduce((s, d) => s + d.cantidad * d.precioUnitario, 0);

  const orden = await prisma.ordenCompra.create({
    data: {
      numero: generarNumeroOrden(),
      proveedorId: parsed.proveedorId,
      usuarioId: parseInt(user.sub, 10),
      total,
      notas: parsed.notas,
      detalles: {
        create: parsed.detalles.map((d) => ({
          productoId: d.productoId,
          cantidad: d.cantidad,
          precioUnitario: d.precioUnitario,
        })),
      },
    },
    include: { proveedor: true, detalles: { include: { producto: true } } },
  });

  await registrarAuditoria({
    usuarioId: parseInt(user.sub, 10),
    accion: 'orden.crear',
    entidad: 'ordenes',
    entidadId: orden.id,
    detalle: orden.numero,
  });

  return NextResponse.json({ data: orden }, { status: 201 });
}

export async function obtenerOrden(
  _req: NextRequest,
  { params }: { params?: Record<string, string> }
): Promise<NextResponse> {
  const id = parseInt(params?.id ?? '0', 10);
  const orden = await prisma.ordenCompra.findUnique({
    where: { id },
    include: {
      proveedor: true,
      usuario: { select: { nombre: true, email: true } },
      detalles: { include: { producto: true } },
    },
  });
  if (!orden) return NextResponse.json({ error: 'No encontrada' }, { status: 404 });
  return NextResponse.json({ data: orden });
}

export async function cambiarEstadoOrden(
  req: NextRequest,
  { user, params }: { user: JwtPayload; params?: Record<string, string> }
): Promise<NextResponse> {
  const id = parseInt(params?.id ?? '0', 10);
  const { estado } = z.object({
    estado: z.enum(['borrador', 'enviada', 'recibida', 'cancelada']),
  }).parse(await req.json());

  const orden = await prisma.ordenCompra.update({
    where: { id },
    data: { estado },
    include: { detalles: { include: { producto: true } } },
  });

  // Al recibir: entrada automática de stock
  if (estado === 'recibida') {
    await prisma.$transaction(async (tx) => {
      for (const d of orden.detalles) {
        const pendiente = d.cantidad - d.recibido;
        if (pendiente <= 0) continue;

        const producto = await tx.producto.findUnique({ where: { id: d.productoId } });
        if (!producto) continue;

        const nuevoStock = producto.stockActual + pendiente;
        await tx.movimiento.create({
          data: {
            productoId: d.productoId,
            usuarioId: parseInt(user.sub, 10),
            tipo: TipoMovimiento.Entrada,
            cantidad: pendiente,
            stockAnterior: producto.stockActual,
            stockPosterior: nuevoStock,
            motivo: `Recepción orden ${orden.numero}`,
            referencia: orden.numero,
          },
        });
        await tx.producto.update({ where: { id: d.productoId }, data: { stockActual: nuevoStock } });
        await tx.ordenCompraDetalle.update({ where: { id: d.id }, data: { recibido: d.cantidad } });
      }
    });
  }

  return NextResponse.json({ data: orden });
}
