import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { obtenerKardex } from '@/controllers/movimientos.controller';

export const GET = checkPermission([PERMISOS.KARDEX_VER], (req, ctx) => obtenerKardex(req, ctx));
