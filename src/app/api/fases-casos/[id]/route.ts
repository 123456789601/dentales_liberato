import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { obtenerFaseCaso, actualizarFaseCaso, eliminarFaseCaso } from '@/controllers/fases-casos.controller';

export const GET = checkPermission([PERMISOS.CASOS_VER, PERMISOS.CASOS_EDITAR], (req, ctx) => obtenerFaseCaso(parseInt(ctx.params?.id || '0')));
export const PUT = checkPermission([PERMISOS.CASOS_EDITAR], (req, ctx) => actualizarFaseCaso(req, ctx));
export const DELETE = checkPermission([PERMISOS.CASOS_EDITAR], (req, ctx) => eliminarFaseCaso(req, ctx));
