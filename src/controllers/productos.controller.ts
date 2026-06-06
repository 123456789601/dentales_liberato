import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { calcularValorTotalInventario, enriquecerProductos } from '@/lib/inventory';
import { JwtPayload } from '@/lib/auth';
import { puedeVerCostos, puedeEditarPrecios, puedeEliminarProductos } from '@/middleware/checkRole';
import { registrarAuditoria } from '@/lib/auditoria';
import { UnidadMedida } from '@prisma/client';

const productoSchema = z.object({
  nombre: z.string().min(2).max(200),
  descripcion: z.string().optional(),
  skuCode: z.string().min(2).max(50),
  stockActual: z.number().int().min(0).optional(),
  stockMinimo: z.number().int().min(0),
  unidadMedida: z.enum(['gramo', 'kilogramo', 'mililitro', 'litro', 'unidad', 'caja', 'frasco', 'bolsa']),
  precioUnitario: z.number().min(0).optional(),
  fechaVencimiento: z.string().optional().nullable(),
  ubicacionBodega: z.string().optional().nullable(),
  categoriaId: z.number().int().positive(),
  proveedorId: z.number().int().positive().optional().nullable(),
});

export async function listarProductos(req: NextRequest, { user }: { user: JwtPayload }): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') ?? '';
  const categoriaId = searchParams.get('categoriaId');
  const semaforo = searchParams.get('semaforo');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = Math.min(100, Math.max(5, parseInt(searchParams.get('limit') ?? '15', 10)));
  const skip = (page - 1) * limit;

  const where = {
    activo: true,
    ...(q && {
      OR: [
        { nombre: { contains: q } },
        { skuCode: { contains: q } },
        { descripcion: { contains: q } },
        { ubicacionBodega: { contains: q } },
      ],
    }),
    ...(categoriaId && { categoriaId: parseInt(categoriaId, 10) }),
  };

  const [productos, total] = await Promise.all([
    prisma.producto.findMany({
      where,
      include: { categoria: true, proveedor: true },
      orderBy: { nombre: 'asc' },
      skip,
      take: limit,
    }),
    prisma.producto.count({ where }),
  ]);

  let data = enriquecerProductos(productos);
  if (semaforo) data = data.filter((p) => p.semaforo === semaforo);

  if (!puedeVerCostos(user)) {
    data = data.map((p) => ({ ...p, precioUnitario: 0, valorEnBodega: 0 }));
  }

  const valorTotal = puedeVerCostos(user) ? await calcularValorTotalInventario() : undefined;

  return NextResponse.json({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    valorTotalInventario: valorTotal,
  });
}

export async function obtenerProducto(
  _req: NextRequest,
  { user, params }: { user: JwtPayload; params?: Record<string, string> }
): Promise<NextResponse> {
  const id = parseInt(params?.id ?? '0', 10);
  const producto = await prisma.producto.findUnique({
    where: { id, activo: true },
    include: { categoria: true, proveedor: true },
  });
  if (!producto) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });

  const enriquecido = enriquecerProductos([producto])[0];
  if (!enriquecido) return NextResponse.json({ error: 'No encontrado' }, { status: 404 });
  const data = !puedeVerCostos(user)
    ? { ...enriquecido, precioUnitario: 0, valorEnBodega: 0 }
    : enriquecido;
  return NextResponse.json({ data });
}

export async function crearProducto(req: NextRequest, { user }: { user: JwtPayload }): Promise<NextResponse> {
  const parsed = productoSchema.parse(await req.json());
  const producto = await prisma.producto.create({
    data: {
      nombre: parsed.nombre,
      descripcion: parsed.descripcion,
      skuCode: parsed.skuCode,
      stockActual: parsed.stockActual ?? 0,
      stockMinimo: parsed.stockMinimo,
      unidadMedida: parsed.unidadMedida as UnidadMedida,
      precioUnitario: parsed.precioUnitario ?? 0,
      fechaVencimiento: parsed.fechaVencimiento ? new Date(parsed.fechaVencimiento) : null,
      ubicacionBodega: parsed.ubicacionBodega,
      categoriaId: parsed.categoriaId,
      proveedorId: parsed.proveedorId ?? null,
    },
    include: { categoria: true, proveedor: true },
  });

  await registrarAuditoria({
    usuarioId: parseInt(user.sub, 10),
    accion: 'producto.crear',
    entidad: 'productos',
    entidadId: producto.id,
    detalle: producto.nombre,
  });

  return NextResponse.json({ data: enriquecerProductos([producto])[0] }, { status: 201 });
}

export async function actualizarProducto(
  req: NextRequest,
  { user, params }: { user: JwtPayload; params?: Record<string, string> }
): Promise<NextResponse> {
  const id = parseInt(params?.id ?? '0', 10);
  const parsed = productoSchema.partial().parse(await req.json());

  if (parsed.precioUnitario !== undefined && !puedeEditarPrecios(user)) {
    return NextResponse.json({ error: 'Sin permiso para editar precios.' }, { status: 403 });
  }

  const producto = await prisma.producto.update({
    where: { id },
    data: {
      ...parsed,
      unidadMedida: parsed.unidadMedida as UnidadMedida | undefined,
      fechaVencimiento: parsed.fechaVencimiento !== undefined
        ? parsed.fechaVencimiento ? new Date(parsed.fechaVencimiento) : null
        : undefined,
    },
    include: { categoria: true, proveedor: true },
  });

  await registrarAuditoria({
    usuarioId: parseInt(user.sub, 10),
    accion: 'producto.editar',
    entidad: 'productos',
    entidadId: id,
  });

  return NextResponse.json({ data: enriquecerProductos([producto])[0] });
}

export async function eliminarProducto(
  _req: NextRequest,
  { user, params }: { user: JwtPayload; params?: Record<string, string> }
): Promise<NextResponse> {
  if (!puedeEliminarProductos(user)) {
    return NextResponse.json({ error: 'Sin permiso para eliminar.' }, { status: 403 });
  }
  const id = parseInt(params?.id ?? '0', 10);
  await prisma.producto.update({ where: { id }, data: { activo: false } });
  await registrarAuditoria({
    usuarioId: parseInt(user.sub, 10),
    accion: 'producto.eliminar',
    entidad: 'productos',
    entidadId: id,
  });
  return NextResponse.json({ message: 'Producto desactivado' });
}
