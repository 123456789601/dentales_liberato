import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { registrarConteoFisico } from '@/controllers/conteos.controller';

export const PATCH = checkPermission([PERMISOS.CONTEOS_GESTIONAR], (req, ctx) => registrarConteoFisico(req, ctx));
