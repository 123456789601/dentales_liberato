import { requireAuth } from '@/middleware/checkRole';
import { obtenerDashboard } from '@/controllers/dashboard.controller';

export const GET = requireAuth((_req, ctx) => obtenerDashboard(ctx));
