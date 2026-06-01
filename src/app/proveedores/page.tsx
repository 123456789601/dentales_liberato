'use client';

import { useEffect, useState, FormEvent } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { useSession } from '@/hooks/useSession';
import { PERMISOS } from '@/lib/permissions';
import { Truck, Plus } from 'lucide-react';

export default function ProveedoresPage() {
  const { loading, tiene } = useSession();
  const [lista, setLista] = useState<{ id: number; nombre: string; contacto: string | null; telefono: string | null; email: string | null; _count: { productos: number } }[]>([]);
  const [form, setForm] = useState({ nombre: '', contacto: '', telefono: '', email: '' });
  const [show, setShow] = useState(false);

  function cargar() { fetch('/api/proveedores').then((r) => r.json()).then((d) => setLista(d.data ?? [])); }
  useEffect(() => { if (!loading) cargar(); }, [loading]);

  async function crear(e: FormEvent) {
    e.preventDefault();
    await fetch('/api/proveedores', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    setShow(false); setForm({ nombre: '', contacto: '', telefono: '', email: '' }); cargar();
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex justify-between">
          <div><h1 className="text-2xl font-bold flex items-center gap-2"><Truck className="h-7 w-7 text-clinica-600" /> Proveedores</h1></div>
          {tiene(PERMISOS.PROVEEDORES_GESTIONAR) && (
            <button type="button" onClick={() => setShow(!show)} className="flex items-center gap-2 rounded-lg bg-clinica-600 px-4 py-2 text-sm text-white"><Plus className="h-4 w-4" /> Nuevo</button>
          )}
        </div>
        {show && (
          <form onSubmit={crear} className="grid gap-3 sm:grid-cols-2 rounded-xl border bg-white p-4 shadow-sm">
            <input required value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} placeholder="Nombre *" className="rounded-lg border px-3 py-2 text-sm" />
            <input value={form.contacto} onChange={(e) => setForm({ ...form, contacto: e.target.value })} placeholder="Contacto" className="rounded-lg border px-3 py-2 text-sm" />
            <input value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} placeholder="Teléfono" className="rounded-lg border px-3 py-2 text-sm" />
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" className="rounded-lg border px-3 py-2 text-sm" />
            <button type="submit" className="sm:col-span-2 rounded-lg bg-clinica-600 py-2 text-sm text-white">Guardar</button>
          </form>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((p) => (
            <div key={p.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <p className="font-semibold">{p.nombre}</p>
              {p.contacto && <p className="text-sm text-slate-600">{p.contacto}</p>}
              {p.telefono && <p className="text-sm text-slate-500">{p.telefono}</p>}
              <p className="mt-2 text-xs text-slate-400">{p._count.productos} productos vinculados</p>
            </div>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}
