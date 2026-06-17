import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { listarUsuarios, crearUsuario } from '@/controllers/usuarios.controller';

export const GET = checkPermission([PERMISOS.USUARIOS_VER], () => listarUsuarios());
export const POST = checkPermission([PERMISOS.USUARIOS_GESTIONAR], (req, ctx) => crearUsuario(req, ctx));
