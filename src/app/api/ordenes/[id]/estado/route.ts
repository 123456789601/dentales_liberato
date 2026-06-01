import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { cambiarEstadoOrden } from '@/controllers/ordenes.controller';

export const PATCH = checkPermission([PERMISOS.ORDENES_GESTIONAR], (req, ctx) => cambiarEstadoOrden(req, ctx));
