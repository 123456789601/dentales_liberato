import { requireAuth } from '@/middleware/checkRole';
import { actividadReciente } from '@/controllers/actividad.controller';

export const GET = requireAuth(() => actividadReciente());
