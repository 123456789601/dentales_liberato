import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { listarRoles, listarPermisos } from '@/controllers/roles.controller';

export const GET = checkPermission([PERMISOS.ROLES_VER, PERMISOS.USUARIOS_GESTIONAR], async (req) => {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('permisos') === '1') return listarPermisos();
  return listarRoles();
});
