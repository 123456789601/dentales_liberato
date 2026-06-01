import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { listarCategorias, crearCategoria } from '@/controllers/categorias.controller';

export const GET = checkPermission([PERMISOS.CATEGORIAS_VER, PERMISOS.INVENTARIO_VER], () => listarCategorias());
export const POST = checkPermission([PERMISOS.CATEGORIAS_GESTIONAR], (req) => crearCategoria(req));
