import { checkPermission } from '@/middleware/checkRole';
import { PERMISOS } from '@/lib/permissions';
import { exportarInventarioCsv, resumenInventario } from '@/controllers/reportes.controller';

export const GET = checkPermission([PERMISOS.REPORTES_VER, PERMISOS.REPORTES_EXPORTAR], async (req) => {
  const { searchParams } = new URL(req.url);
  if (searchParams.get('format') === 'csv') return exportarInventarioCsv();
  return resumenInventario();
});
