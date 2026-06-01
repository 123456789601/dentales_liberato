import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { listarAuditoria } from '@/controllers/auditoria.controller';

export const GET = checkPermission([PERMISOS.AUDITORIA_VER], (req) => listarAuditoria(req));
