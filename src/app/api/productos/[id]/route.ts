import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { obtenerProducto, actualizarProducto, eliminarProducto } from '@/controllers/productos.controller';

export const GET = checkPermission([PERMISOS.INVENTARIO_VER], (req, ctx) => obtenerProducto(req, ctx));
export const PUT = checkPermission([PERMISOS.PRODUCTOS_EDITAR], (req, ctx) => actualizarProducto(req, ctx));
export const DELETE = checkPermission([PERMISOS.PRODUCTOS_ELIMINAR], (req, ctx) => eliminarProducto(req, ctx));
