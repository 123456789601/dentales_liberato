'use client';

/**
 * Dentales Liberato - Formulario de inicio de sesión profesional
 * Diseño moderno con validaciones de seguridad
 */
import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Loader2, AlertCircle, Eye, EyeOff, Lock, Mail, CheckCircle } from 'lucide-react';

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');

    // Validaciones de seguridad
    if (!email || !email.includes('@')) {
      setError('Por favor ingrese un correo electrónico válido');
      return;
    }

    if (!password || password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Error al iniciar sesión');
        return;
      }

      router.push('/dashboard');
      router.refresh();
    } catch {
      setError('No se pudo conectar con el servidor. Verifique su conexión.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      {/* Logo y branding */}
      <div className="text-center mb-8">
        <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-600/30 mb-4">
          <Shield className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Dentales Liberato
        </h1>
        <p className="text-gray-600">
          Sistema de Gestión ERP Integral
        </p>
      </div>

      {/* Tarjeta del formulario */}
      <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 animate-pulse">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Campo de email */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@dentalesliberato.com"
                required
                autoComplete="email"
                className="w-full rounded-xl border border-gray-300 pl-12 pr-4 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400"
              />
            </div>
          </div>

          {/* Campo de contraseña */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                className="w-full rounded-xl border border-gray-300 pl-12 pr-12 py-3 text-sm outline-none transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 hover:border-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Recordar sesión y recuperar contraseña */}
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-600">Recordar sesión</span>
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
              ¿Olvidó su contraseña?
            </a>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 transition-all hover:shadow-xl hover:shadow-blue-600/40 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Iniciando sesión...
              </>
            ) : (
              <>
                <Shield className="h-5 w-5" />
                Iniciar Sesión
              </>
            )}
          </button>
        </form>

        {/* Información de seguridad */}
        <div className="mt-6 pt-6 border-t border-gray-100">
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <div className="text-xs text-gray-500">
              <p className="font-medium text-gray-700 mb-1">Seguridad garantizada</p>
              <p>Sistema protegido con encriptación de extremo a extremo y autenticación JWT segura.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer del formulario */}
      <p className="mt-6 text-center text-sm text-gray-500">
        Sistema exclusivo para personal autorizado de{' '}
        <span className="font-semibold text-gray-700">Dentales Liberato</span>
      </p>

      {/* Enlace a la landing page */}
      <div className="mt-4 text-center">
        <a href="/" className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
          ← Volver al inicio
        </a>
      </div>
    </div>
  );
}
