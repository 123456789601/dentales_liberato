import { requireAuth } from '@/middleware/checkRole';
import { actualizarPerfil } from '@/controllers/perfil.controller';

export const PUT = requireAuth((req, ctx) => actualizarPerfil(req, ctx));
