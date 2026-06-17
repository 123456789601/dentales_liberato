import { LoginForm } from '@/components/LoginForm';

/**
 * Dentales Liberato - Página de inicio de sesión
 * Fondo médico sutil con branding clínico
 */
export default function LoginPage() {
  return (
    <div className="bg-medico flex min-h-screen items-center justify-center p-4">
      <LoginForm />
    </div>
  );
}
