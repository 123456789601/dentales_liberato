import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { crearMovimiento, listarMovimientos } from '@/controllers/movimientos.controller';

export const GET = checkPermission([PERMISOS.MOVIMIENTOS_VER], (req) => listarMovimientos(req));
export const POST = checkPermission(
  [PERMISOS.MOVIMIENTOS_ENTRADA, PERMISOS.MOVIMIENTOS_SALIDA, PERMISOS.MOVIMIENTOS_AJUSTE],
  (req, ctx) => crearMovimiento(req, ctx)
);
