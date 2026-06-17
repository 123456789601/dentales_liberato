import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { listarProductos, crearProducto } from '@/controllers/productos.controller';

export const GET = checkPermission([PERMISOS.INVENTARIO_VER], (req, ctx) => listarProductos(req, ctx));
export const POST = checkPermission([PERMISOS.PRODUCTOS_CREAR], (req, ctx) => crearProducto(req, ctx));
