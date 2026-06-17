/**
 * Dentales Liberato - Utilidad de sesión para Server Components
 */
import { obtenerSesionActual } from './auth';
import { redirect } from 'next/navigation';

export async function requireSession() {
  const user = await obtenerSesionActual();
  if (!user) redirect('/login');
  return user;
}
