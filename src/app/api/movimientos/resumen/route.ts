import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { resumenConsumo } from '@/controllers/movimientos.controller';

export const GET = checkPermission([PERMISOS.REPORTES_VER], (req) => resumenConsumo(req));
