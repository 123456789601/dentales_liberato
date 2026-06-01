import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { cerrarConteo } from '@/controllers/conteos.controller';

export const POST = checkPermission([PERMISOS.CONTEOS_GESTIONAR], (req, ctx) => cerrarConteo(req, ctx));
