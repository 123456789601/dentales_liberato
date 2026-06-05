'use client';

import { useEffect, useState } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { useSession } from '@/hooks/useSession';
import { PERMISOS } from '@/lib/permissions';
import { Shield, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Rol { id: number; codigo: string; nombre: string; permisos: { id: number; codigo: string; nombre: string; modulo: string }[]; usuariosCount: number }
interface Permiso { id: number; codigo: string; nombre: string; modulo: string }

export default function RolesPage() {
  const router = useRouter();
  const { loading, tiene } = useSession();
  const [roles, setRoles] = useState<Rol[]>([]);
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [rolSel, setRolSel] = useState<number | null>(null);
  const [sel, setSel] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (!loading) {
      fetch('/api/roles').then((r) => r.json()).then((d) => setRoles(d.data ?? []));
      fetch('/api/roles?permisos=1').then((r) => r.json()).then((d) => setPermisos(d.data ?? []));
    }
  }, [loading]);

  function seleccionarRol(rol: Rol) {
    setRolSel(rol.id);
    setSel(new Set(rol.permisos.map((p) => p.id)));
  }

  async function guardar() {
    if (!rolSel) return;
    await fetch(`/api/roles/${rolSel}/permisos`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permisoIds: Array.from(sel) }),
    });
    alert('Permisos actualizados');
    const r = await fetch('/api/roles');
    const d = await r.json();
    setRoles(d.data ?? []);
  }

  const porModulo = permisos.reduce<Record<string, Permiso[]>>((acc, p) => {
    (acc[p.modulo] ??= []).push(p);
    return acc;
  }, {});

  if (loading) return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Shield className="h-7 w-7 text-clinica-600" /> Roles y permisos</h1>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">Roles</p>
            {roles.map((r) => (
              <button key={r.id} type="button" onClick={() => seleccionarRol(r)}
                className={`w-full rounded-lg border p-3 text-left text-sm transition ${rolSel === r.id ? 'border-clinica-500 bg-clinica-50' : 'hover:bg-slate-50'}`}>
                <p className="font-semibold">{r.nombre}</p>
                <p className="text-xs text-slate-400">{r.codigo} · {r.usuariosCount} usuarios · {r.permisos.length} permisos</p>
              </button>
            ))}
          </div>
          {rolSel && tiene(PERMISOS.ROLES_GESTIONAR) && (
            <div className="lg:col-span-2 rounded-xl border bg-white p-4 shadow-sm max-h-[70vh] overflow-y-auto">
              <p className="mb-4 font-semibold">Asignar permisos</p>
              {Object.entries(porModulo).map(([mod, perms]) => (
                <div key={mod} className="mb-4">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2">{mod}</p>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {perms.map((p) => (
                      <label key={p.id} className="flex items-start gap-2 rounded-lg border p-2 text-sm cursor-pointer hover:bg-slate-50">
                        <input type="checkbox" checked={sel.has(p.id)} onChange={(e) => {
                          const next = new Set(sel);
                          if (e.target.checked) next.add(p.id); else next.delete(p.id);
                          setSel(next);
                        }} className="mt-0.5" />
                        <span><span className="font-medium">{p.nombre}</span><br /><span className="text-xs text-slate-400">{p.codigo}</span></span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              <button type="button" onClick={guardar} className="mt-4 w-full rounded-lg bg-clinica-600 py-2.5 text-sm font-semibold text-white">Guardar permisos</button>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
