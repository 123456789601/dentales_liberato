import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { listarAlertas } from '@/controllers/alertas.controller';

export const GET = checkPermission([PERMISOS.ALERTAS_VER], () => listarAlertas());
