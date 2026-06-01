import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { listarProveedores, crearProveedor } from '@/controllers/proveedores.controller';

export const GET = checkPermission([PERMISOS.PROVEEDORES_VER, PERMISOS.PROVEEDORES_GESTIONAR], () => listarProveedores());
export const POST = checkPermission([PERMISOS.PROVEEDORES_GESTIONAR], (req) => crearProveedor(req));
