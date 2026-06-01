'use client';

import { useEffect, useState, FormEvent } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { useSession } from '@/hooks/useSession';
import { PERMISOS } from '@/lib/permissions';
import { Plus, UserCog } from 'lucide-react';

interface Rol { id: number; codigo: string; nombre: string }
interface UsuarioRow { id: number; nombre: string; email: string; activo: boolean; rol: Rol }

export default function UsuariosPage() {
  const { user, loading, tiene } = useSession();
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>([]);
  const [roles, setRoles] = useState<Rol[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: '', email: '', password: '', rolId: 0 });

  function cargar() {
    fetch('/api/usuarios').then((r) => r.json()).then((d) => setUsuarios(d.data ?? []));
    fetch('/api/roles').then((r) => r.json()).then((d) => setRoles(d.data ?? []));
  }

  useEffect(() => {
    if (!loading && user && tiene(PERMISOS.USUARIOS_VER)) cargar();
  }, [loading, user]);

  async function crear(e: FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/usuarios', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ nombre: '', email: '', password: '', rolId: roles[0]?.id ?? 0 });
      cargar();
    }
  }

  if (loading || !user) return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;
  if (!tiene(PERMISOS.USUARIOS_VER)) return <ClientLayout><p className="text-red-600">Sin permiso</p></ClientLayout>;

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><UserCog className="h-7 w-7 text-clinica-600" /> Usuarios</h1>
            <p className="text-sm text-slate-500">Gestión de personal y asignación de roles</p>
          </div>
          {tiene(PERMISOS.USUARIOS_GESTIONAR) && (
            <button type="button" onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-clinica-600 px-4 py-2 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" /> Nuevo usuario
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={crear} className="rounded-xl border bg-white p-5 grid gap-3 sm:grid-cols-2 shadow-sm">
            <input value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} required placeholder="Nombre" className="rounded-lg border px-3 py-2 text-sm" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required placeholder="Email" className="rounded-lg border px-3 py-2 text-sm" />
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={6} placeholder="Contraseña" className="rounded-lg border px-3 py-2 text-sm" />
            <select value={form.rolId} onChange={(e) => setForm({ ...form, rolId: parseInt(e.target.value, 10) })} required className="rounded-lg border px-3 py-2 text-sm">
              {roles.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
            <button type="submit" className="sm:col-span-2 rounded-lg bg-clinica-600 py-2 text-sm font-semibold text-white">Crear usuario</button>
          </form>
        )}

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Nombre</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Rol</th>
                <th className="px-4 py-3">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {usuarios.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-medium">{u.nombre}</td>
                  <td className="px-4 py-3">{u.email}</td>
                  <td className="px-4 py-3"><span className="rounded-full bg-clinica-50 px-2 py-0.5 text-xs text-clinica-700">{u.rol.nombre}</span></td>
                  <td className="px-4 py-3">{u.activo ? <span className="text-green-600">Activo</span> : <span className="text-red-600">Inactivo</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ClientLayout>
  );
}
