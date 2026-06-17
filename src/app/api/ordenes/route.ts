import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { listarOrdenes, crearOrden } from '@/controllers/ordenes.controller';

export const GET = checkPermission([PERMISOS.ORDENES_VER], (req) => listarOrdenes(req));
export const POST = checkPermission([PERMISOS.ORDENES_GESTIONAR], (req, ctx) => crearOrden(req, ctx));
