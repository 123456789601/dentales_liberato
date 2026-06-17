/**
 * Dentales Liberato - Registro de auditoría
 */
import { prisma } from './prisma';

export async function registrarAuditoria(params: {
  usuarioId?: number;
  accion: string;
  entidad: string;
  entidadId?: number;
  detalle?: string;
}) {
  try {
    await prisma.auditoria.create({
      data: {
        usuarioId: params.usuarioId,
        accion: params.accion,
        entidad: params.entidad,
        entidadId: params.entidadId,
        detalle: params.detalle,
      },
    });
  } catch {
    // No bloquear operación principal si falla auditoría
  }
}
