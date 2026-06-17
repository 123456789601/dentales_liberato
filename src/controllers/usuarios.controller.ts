import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { hashearPassword } from '@/lib/auth';
import { registrarAuditoria } from '@/lib/auditoria';
import { JwtPayload } from '@/lib/auth';

const usuarioSchema = z.object({
  nombre: z.string().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).optional(),
  rolId: z.number().int().positive(),
  activo: z.boolean().optional(),
});

export async function listarUsuarios(): Promise<NextResponse> {
  const usuarios = await prisma.usuario.findMany({
    include: { rol: { select: { id: true, codigo: true, nombre: true } } },
    orderBy: { nombre: 'asc' },
  });
  return NextResponse.json({
    data: usuarios.map((u) => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      activo: u.activo,
      rol: u.rol,
      createdAt: u.createdAt,
    })),
  });
}

export async function crearUsuario(req: NextRequest, { user }: { user: JwtPayload }): Promise<NextResponse> {
  const parsed = usuarioSchema.parse(await req.json());
  if (!parsed.password) {
    return NextResponse.json({ error: 'Contraseña requerida' }, { status: 400 });
  }

  const passwordHash = await hashearPassword(parsed.password);
  const nuevo = await prisma.usuario.create({
    data: {
      nombre: parsed.nombre,
      email: parsed.email.toLowerCase(),
      passwordHash,
      rolId: parsed.rolId,
    },
    include: { rol: true },
  });

  await registrarAuditoria({
    usuarioId: parseInt(user.sub, 10),
    accion: 'usuario.crear',
    entidad: 'usuarios',
    entidadId: nuevo.id,
  });

  return NextResponse.json({ data: { id: nuevo.id, nombre: nuevo.nombre, email: nuevo.email, rol: nuevo.rol } }, { status: 201 });
}

export async function actualizarUsuario(
  req: NextRequest,
  { user, params }: { user: JwtPayload; params?: Record<string, string> }
): Promise<NextResponse> {
  const id = parseInt(params?.id ?? '0', 10);
  const parsed = usuarioSchema.partial().parse(await req.json());

  const data: Record<string, unknown> = {
    nombre: parsed.nombre,
    email: parsed.email?.toLowerCase(),
    rolId: parsed.rolId,
    activo: parsed.activo,
  };
  if (parsed.password) {
    data.passwordHash = await hashearPassword(parsed.password);
  }

  const actualizado = await prisma.usuario.update({
    where: { id },
    data,
    include: { rol: true },
  });

  await registrarAuditoria({
    usuarioId: parseInt(user.sub, 10),
    accion: 'usuario.editar',
    entidad: 'usuarios',
    entidadId: id,
  });

  return NextResponse.json({ data: actualizado });
}
