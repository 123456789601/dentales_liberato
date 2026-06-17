/**
 * Dentales Liberato - Servicio de notificaciones in-app
 */
import { prisma } from './prisma';

export async function crearNotificacion(params: {
  usuarioId: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  link?: string;
}) {
  return prisma.notificacion.create({ data: params });
}

/** Notifica a todos los admins */
export async function notificarAdmins(params: Omit<Parameters<typeof crearNotificacion>[0], 'usuarioId'>) {
  const admins = await prisma.usuario.findMany({
    where: { activo: true, rol: { codigo: 'admin' } },
    select: { id: true },
  });
  for (const admin of admins) {
    await crearNotificacion({ ...params, usuarioId: admin.id });
  }
}
