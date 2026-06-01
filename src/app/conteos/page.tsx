'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ClientLayout } from '@/components/ClientLayout';
import { useSession } from '@/hooks/useSession';
import { PERMISOS } from '@/lib/permissions';
import { Plus, ClipboardCheck } from 'lucide-react';
import { formatDate } from '@/lib/format';

export default function ConteosPage() {
  const { loading, tiene } = useSession();
  const [conteos, setConteos] = useState<{ id: number; estado: string; createdAt: string; usuario: { nombre: string }; _count: { detalles: number } }[]>([]);

  function cargar() {
    fetch('/api/conteos').then((r) => r.json()).then((d) => setConteos(d.data ?? []));
  }

  useEffect(() => {
    if (!loading) cargar();
  }, [loading]);

  async function nuevoConteo() {
    const res = await fetch('/api/conteos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notas: 'Conteo programado' }),
    });
    if (res.ok) {
      const d = await res.json();
      window.location.href = `/conteos/${d.data.id}`;
    }
  }

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ClipboardCheck className="h-7 w-7 text-clinica-600" /> Conteo físico
            </h1>
            <p className="text-sm text-slate-500">Toma física de inventario y ajustes automáticos</p>
          </div>
          {tiene(PERMISOS.CONTEOS_GESTIONAR) && (
            <button type="button" onClick={nuevoConteo} className="flex items-center gap-2 rounded-lg bg-clinica-600 px-4 py-2 text-sm font-semibold text-white hover:bg-clinica-700">
              <Plus className="h-4 w-4" /> Iniciar conteo
            </button>
          )}
        </div>
        <div className="grid gap-3">
          {conteos.length === 0 ? (
            <p className="text-center text-slate-400 py-12 rounded-xl border bg-white">No hay conteos registrados</p>
          ) : (
            conteos.map((c) => (
              <Link key={c.id} href={`/conteos/${c.id}`} className="flex justify-between rounded-xl border bg-white p-4 shadow-sm hover:border-clinica-200 transition">
                <div>
                  <p className="font-semibold">Conteo #{c.id}</p>
                  <p className="text-sm text-slate-500">{c.usuario.nombre} · {formatDate(c.createdAt)} · {c._count.detalles} productos</p>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium capitalize h-fit ${
                  c.estado === 'completado' ? 'bg-green-100 text-green-800' :
                  c.estado === 'en_progreso' ? 'bg-yellow-100 text-yellow-800' : 'bg-slate-100 text-slate-600'
                }`}>{c.estado.replace('_', ' ')}</span>
              </Link>
            ))
          )}
        </div>
      </div>
    </ClientLayout>
  );
}
