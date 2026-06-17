import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { JwtPayload } from '@/lib/auth';

export async function listarNotificaciones({ user }: { user: JwtPayload }): Promise<NextResponse> {
  const data = await prisma.notificacion.findMany({
    where: { usuarioId: parseInt(user.sub, 10) },
    orderBy: { createdAt: 'desc' },
    take: 30,
  });
  const noLeidas = await prisma.notificacion.count({
    where: { usuarioId: parseInt(user.sub, 10), leida: false },
  });
  return NextResponse.json({ data, noLeidas });
}

export async function marcarLeidas({ user }: { user: JwtPayload }): Promise<NextResponse> {
  await prisma.notificacion.updateMany({
    where: { usuarioId: parseInt(user.sub, 10), leida: false },
    data: { leida: true },
  });
  return NextResponse.json({ message: 'Marcadas como leídas' });
}

export async function marcarUnaLeida(
  _req: NextRequest,
  { user, params }: { user: JwtPayload; params?: Record<string, string> }
): Promise<NextResponse> {
  const id = parseInt(params?.id ?? '0', 10);
  await prisma.notificacion.updateMany({
    where: { id, usuarioId: parseInt(user.sub, 10) },
    data: { leida: true },
  });
  return NextResponse.json({ message: 'OK' });
}
