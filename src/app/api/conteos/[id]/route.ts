import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { obtenerConteo } from '@/controllers/conteos.controller';

export const GET = checkPermission([PERMISOS.CONTEOS_VER], (req, ctx) => obtenerConteo(req, ctx));
