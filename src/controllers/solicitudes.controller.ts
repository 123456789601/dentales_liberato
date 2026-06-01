import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { JwtPayload } from '@/lib/auth';
import { registrarAuditoria } from '@/lib/auditoria';
import { notificarAdmins } from '@/lib/notificaciones';

const crearSchema = z.object({
  productoId: z.number().int().positive(),
  cantidadSolicitada: z.number().int().positive(),
  prioridad: z.enum(['baja', 'media', 'alta', 'urgente']).default('media'),
  motivo: z.string().min(3).max(255),
});

const gestionarSchema = z.object({
  estado: z.enum(['aprobada', 'rechazada', 'surtida']),
  notasAdmin: z.string().optional(),
});

export async function listarSolicitudes(req: NextRequest, { user }: { user: JwtPayload }): Promise<NextResponse> {
  const { searchParams } = new URL(req.url);
  const estado = searchParams.get('estado');
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = 20;

  const where: Record<string, unknown> = {};
  if (estado) where.estado = estado;
  if (user.rolCodigo === 'tecnico_dental') {
    where.usuarioId = parseInt(user.sub, 10);
  }

  const [data, total] = await Promise.all([
    prisma.solicitudReposicion.findMany({
      where,
      include: {
        producto: { select: { id: true, nombre: true, skuCode: true, stockActual: true, stockMinimo: true } },
        usuario: { select: { id: true, nombre: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.solicitudReposicion.count({ where }),
  ]);

  return NextResponse.json({ data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
}

export async function crearSolicitud(req: NextRequest, { user }: { user: JwtPayload }): Promise<NextResponse> {
  const parsed = crearSchema.parse(await req.json());
  const solicitud = await prisma.solicitudReposicion.create({
    data: {
      ...parsed,
      usuarioId: parseInt(user.sub, 10),
    },
    include: { producto: true },
  });

  await registrarAuditoria({
    usuarioId: parseInt(user.sub, 10),
    accion: 'solicitud.crear',
    entidad: 'solicitudes',
    entidadId: solicitud.id,
  });

  await notificarAdmins({
    tipo: 'solicitud',
    titulo: 'Nueva solicitud de reposición',
    mensaje: `${user.nombre} solicitó ${parsed.cantidadSolicitada} uds. de ${solicitud.producto.nombre}`,
    link: '/solicitudes',
  });

  return NextResponse.json({ data: solicitud }, { status: 201 });
}

export async function gestionarSolicitud(
  req: NextRequest,
  { user, params }: { user: JwtPayload; params?: Record<string, string> }
): Promise<NextResponse> {
  const id = parseInt(params?.id ?? '0', 10);
  const { estado, notasAdmin } = gestionarSchema.parse(await req.json());

  const solicitud = await prisma.solicitudReposicion.update({
    where: { id },
    data: { estado, notasAdmin },
    include: { producto: true, usuario: true },
  });

  await registrarAuditoria({
    usuarioId: parseInt(user.sub, 10),
    accion: `solicitud.${estado}`,
    entidad: 'solicitudes',
    entidadId: id,
  });

  return NextResponse.json({ data: solicitud });
}

export async function contarPendientes(): Promise<NextResponse> {
  const total = await prisma.solicitudReposicion.count({ where: { estado: 'pendiente' } });
  return NextResponse.json({ pendientes: total });
}
