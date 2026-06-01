import { requireAuth } from '@/middleware/checkRole';
import { busquedaGlobal } from '@/controllers/buscar.controller';

export const GET = requireAuth((req) => busquedaGlobal(req));
