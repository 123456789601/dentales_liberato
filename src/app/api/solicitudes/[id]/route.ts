import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { gestionarSolicitud } from '@/controllers/solicitudes.controller';

export const PATCH = checkPermission([PERMISOS.SOLICITUDES_GESTIONAR], (req, ctx) => gestionarSolicitud(req, ctx));
