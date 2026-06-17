import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { exportarMovimientosCsv } from '@/controllers/reportes.controller';

export const GET = checkPermission([PERMISOS.REPORTES_EXPORTAR], (req) => exportarMovimientosCsv(req));
