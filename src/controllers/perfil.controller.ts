import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { JwtPayload, verificarPassword, hashearPassword } from '@/lib/auth';

export async function actualizarPerfil(
  req: NextRequest,
  { user }: { user: JwtPayload }
): Promise<NextResponse> {
  const body = z.object({
    nombre: z.string().min(2).max(120).optional(),
    passwordActual: z.string().optional(),
    passwordNueva: z.string().min(6).optional(),
  }).parse(await req.json());

  const id = parseInt(user.sub, 10);
  const usuario = await prisma.usuario.findUnique({ where: { id } });
  if (!usuario) return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });

  const data: { nombre?: string; passwordHash?: string } = {};
  if (body.nombre) data.nombre = body.nombre;

  if (body.passwordNueva) {
    if (!body.passwordActual) {
      return NextResponse.json({ error: 'Indique la contraseña actual' }, { status: 400 });
    }
    const valida = await verificarPassword(body.passwordActual, usuario.passwordHash);
    if (!valida) return NextResponse.json({ error: 'Contraseña actual incorrecta' }, { status: 400 });
    data.passwordHash = await hashearPassword(body.passwordNueva);
  }

  const actualizado = await prisma.usuario.update({
    where: { id },
    data,
    select: { id: true, nombre: true, email: true },
  });

  return NextResponse.json({ data: actualizado });
}
