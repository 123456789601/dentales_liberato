import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { actualizarPermisosRol } from '@/controllers/roles.controller';

export const PUT = checkPermission([PERMISOS.ROLES_GESTIONAR], (req, ctx) => actualizarPermisosRol(req, ctx));
