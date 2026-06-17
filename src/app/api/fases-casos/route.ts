import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { listarFasesCasos, crearFaseCaso } from '@/controllers/fases-casos.controller';

export const GET = checkPermission([PERMISOS.CASOS_VER, PERMISOS.CASOS_EDITAR], listarFasesCasos);
export const POST = checkPermission([PERMISOS.CASOS_EDITAR], crearFaseCaso);
