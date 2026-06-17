import { requireAuth } from '@/middleware/checkRole';
import { contarPendientes } from '@/controllers/solicitudes.controller';

export const GET = requireAuth(() => contarPendientes());
