import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { obtenerOrden } from '@/controllers/ordenes.controller';

export const GET = checkPermission([PERMISOS.ORDENES_VER], (req, ctx) => obtenerOrden(req, ctx));
