import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { actualizarUsuario } from '@/controllers/usuarios.controller';

export const PUT = checkPermission([PERMISOS.USUARIOS_GESTIONAR], (req, ctx) => actualizarUsuario(req, ctx));
