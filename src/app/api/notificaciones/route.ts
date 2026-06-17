import { requireAuth } from '@/middleware/checkRole';
import { listarNotificaciones, marcarLeidas } from '@/controllers/notificaciones.controller';

export const GET = requireAuth((_req, ctx) => listarNotificaciones(ctx));
export const PATCH = requireAuth((_req, ctx) => marcarLeidas(ctx));
