'use client';

import { useEffect, useState, FormEvent } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { useSession } from '@/hooks/useSession';
import { PERMISOS } from '@/lib/permissions';
import { Tags, Plus } from 'lucide-react';

export default function CategoriasPage() {
  const { loading, tiene } = useSession();
  const [cats, setCats] = useState<{ id: number; nombre: string; descripcion: string | null; _count: { productos: number } }[]>([]);
  const [nombre, setNombre] = useState('');
  const [desc, setDesc] = useState('');

  function cargar() { fetch('/api/categorias').then((r) => r.json()).then((d) => setCats(d.data ?? [])); }
  useEffect(() => { if (!loading) cargar(); }, [loading]);

  async function crear(e: FormEvent) {
    e.preventDefault();
    await fetch('/api/categorias', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nombre, descripcion: desc }) });
    setNombre(''); setDesc(''); cargar();
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Tags className="h-7 w-7 text-clinica-600" /> Categorías</h1>
        {tiene(PERMISOS.CATEGORIAS_GESTIONAR) && (
          <form onSubmit={crear} className="flex flex-wrap gap-2 rounded-xl border bg-white p-4 shadow-sm">
            <input required value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre categoría" className="flex-1 min-w-[200px] rounded-lg border px-3 py-2 text-sm" />
            <input value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Descripción" className="flex-1 min-w-[200px] rounded-lg border px-3 py-2 text-sm" />
            <button type="submit" className="rounded-lg bg-clinica-600 px-4 py-2 text-sm text-white flex items-center gap-1"><Plus className="h-4 w-4" /> Agregar</button>
          </form>
        )}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
          {cats.map((c) => (
            <div key={c.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="font-semibold text-lg">{c.nombre}</p>
              {c.descripcion && <p className="text-sm text-slate-500 mt-1">{c.descripcion}</p>}
              <p className="mt-3 text-xs text-clinica-600 font-medium">{c._count.productos} productos</p>
            </div>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}
