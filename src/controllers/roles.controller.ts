import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';

export async function listarRoles(): Promise<NextResponse> {
  const roles = await prisma.rol.findMany({
    where: { activo: true },
    include: {
      permisos: { include: { permiso: true } },
      _count: { select: { usuarios: true } },
    },
    orderBy: { nombre: 'asc' },
  });

  return NextResponse.json({
    data: roles.map((r) => ({
      id: r.id,
      codigo: r.codigo,
      nombre: r.nombre,
      descripcion: r.descripcion,
      usuariosCount: r._count.usuarios,
      permisos: r.permisos.map((rp) => rp.permiso),
    })),
  });
}

export async function listarPermisos(): Promise<NextResponse> {
  const permisos = await prisma.permiso.findMany({ orderBy: [{ modulo: 'asc' }, { nombre: 'asc' }] });
  const porModulo = permisos.reduce<Record<string, typeof permisos>>((acc, p) => {
    (acc[p.modulo] ??= []).push(p);
    return acc;
  }, {});
  return NextResponse.json({ data: permisos, porModulo });
}

/** Actualiza permisos de un rol */
export async function actualizarPermisosRol(
  req: NextRequest,
  { params }: { params?: Record<string, string> }
): Promise<NextResponse> {
  const rolId = parseInt(params?.id ?? '0', 10);
  const { permisoIds } = z.object({ permisoIds: z.array(z.number().int().positive()) }).parse(await req.json());

  await prisma.$transaction(async (tx) => {
    await tx.rolPermiso.deleteMany({ where: { rolId } });
    if (permisoIds.length > 0) {
      await tx.rolPermiso.createMany({
        data: permisoIds.map((permisoId) => ({ rolId, permisoId })),
      });
    }
  });

  const rol = await prisma.rol.findUnique({
    where: { id: rolId },
    include: { permisos: { include: { permiso: true } } },
  });

  return NextResponse.json({ data: rol });
}
