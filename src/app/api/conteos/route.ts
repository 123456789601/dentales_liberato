import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { listarConteos, crearConteo } from '@/controllers/conteos.controller';

export const GET = checkPermission([PERMISOS.CONTEOS_VER], () => listarConteos());
export const POST = checkPermission([PERMISOS.CONTEOS_GESTIONAR], (req, ctx) => crearConteo(req, ctx));
