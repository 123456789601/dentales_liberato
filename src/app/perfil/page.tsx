'use client';

import { useState, useEffect, FormEvent } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { useSession } from '@/hooks/useSession';
import { User, Key } from 'lucide-react';

export default function PerfilPage() {
  const { user, loading } = useSession();
  const [nombre, setNombre] = useState('');
  const [passActual, setPassActual] = useState('');
  const [passNueva, setPassNueva] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  useEffect(() => { if (user) setNombre(user.nombre); }, [user]);

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setMsg(''); setErr('');
    const res = await fetch('/api/perfil', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        nombre: nombre || undefined,
        passwordActual: passNueva ? passActual : undefined,
        passwordNueva: passNueva || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) { setErr(data.error); return; }
    setMsg('Perfil actualizado correctamente');
    setPassActual(''); setPassNueva('');
  }

  if (loading || !user) return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;

  return (
    <ClientLayout>
      <div className="mx-auto max-w-lg space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><User className="h-7 w-7 text-clinica-600" /> Mi perfil</h1>
        <div className="rounded-xl border bg-white p-5 shadow-sm space-y-2 text-sm">
          <p><span className="text-slate-500">Email:</span> {user.email}</p>
          <p><span className="text-slate-500">Rol:</span> {user.rolNombre}</p>
        </div>
        <form onSubmit={guardar} className="rounded-xl border bg-white p-5 shadow-sm space-y-4">
          <div>
            <label className="text-sm font-medium">Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
          </div>
          <hr />
          <p className="flex items-center gap-2 text-sm font-medium"><Key className="h-4 w-4" /> Cambiar contraseña</p>
          <input type="password" value={passActual} onChange={(e) => setPassActual(e.target.value)} placeholder="Contraseña actual" className="w-full rounded-lg border px-3 py-2 text-sm" />
          <input type="password" value={passNueva} onChange={(e) => setPassNueva(e.target.value)} placeholder="Nueva contraseña (mín. 6)" minLength={6} className="w-full rounded-lg border px-3 py-2 text-sm" />
          {err && <p className="text-sm text-red-600">{err}</p>}
          {msg && <p className="text-sm text-green-600">{msg}</p>}
          <button type="submit" className="w-full rounded-lg bg-clinica-600 py-2.5 text-sm font-semibold text-white">Guardar cambios</button>
        </form>
      </div>
    </ClientLayout>
  );
}
