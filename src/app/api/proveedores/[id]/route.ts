import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { actualizarProveedor } from '@/controllers/proveedores.controller';

export const PUT = checkPermission([PERMISOS.PROVEEDORES_GESTIONAR], (req, ctx) => actualizarProveedor(req, ctx));
