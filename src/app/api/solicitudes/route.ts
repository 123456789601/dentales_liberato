import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { listarSolicitudes, crearSolicitud } from '@/controllers/solicitudes.controller';

export const GET = checkPermission(
  [PERMISOS.SOLICITUDES_CREAR, PERMISOS.SOLICITUDES_GESTIONAR],
  (req, ctx) => listarSolicitudes(req, ctx)
);
export const POST = checkPermission([PERMISOS.SOLICITUDES_CREAR], (req, ctx) => crearSolicitud(req, ctx));
