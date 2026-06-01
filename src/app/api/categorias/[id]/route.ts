import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { actualizarCategoria, eliminarCategoria } from '@/controllers/categorias.controller';

export const PUT = checkPermission([PERMISOS.CATEGORIAS_GESTIONAR], (req, ctx) => actualizarCategoria(req, ctx));
export const DELETE = checkPermission([PERMISOS.CATEGORIAS_GESTIONAR], (req, ctx) => eliminarCategoria(req, ctx));
