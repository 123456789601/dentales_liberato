'use client';

import { useEffect, useState, FormEvent } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { useSession } from '@/hooks/useSession';
import { PERMISOS } from '@/lib/permissions';
import { Plus, Check, X, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Solicitud {
  id: number;
  cantidadSolicitada: number;
  prioridad: string;
  estado: string;
  motivo: string;
  createdAt: string;
  producto: { id: number; nombre: string; skuCode: string; stockActual: number };
  usuario: { nombre: string };
}

export default function SolicitudesPage() {
  const router = useRouter();
  const { user, loading, tiene } = useSession();
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [productos, setProductos] = useState<{ id: number; nombre: string; skuCode: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ productoId: '', cantidad: 1, prioridad: 'media', motivo: '' });
  const [filtro, setFiltro] = useState('');

  function cargar() {
    const params = filtro ? `?estado=${filtro}` : '';
    fetch(`/api/solicitudes${params}`).then((r) => r.json()).then((d) => setSolicitudes(d.data ?? []));
  }

  useEffect(() => {
    if (!loading && user) {
      cargar();
      fetch('/api/productos?limit=200').then((r) => r.json()).then((d) => setProductos(d.data ?? []));
    }
  }, [loading, user, filtro]);

  async function crear(e: FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/solicitudes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productoId: parseInt(form.productoId, 10),
        cantidadSolicitada: form.cantidad,
        prioridad: form.prioridad,
        motivo: form.motivo,
      }),
    });
    if (res.ok) {
      setShowForm(false);
      setForm({ productoId: '', cantidad: 1, prioridad: 'media', motivo: '' });
      cargar();
    }
  }

  async function gestionar(id: number, estado: 'aprobada' | 'rechazada' | 'surtida') {
    await fetch(`/api/solicitudes/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    cargar();
  }

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold">Solicitudes de reposición</h1>
              <p className="text-sm text-slate-500">Pida insumos cuando el stock esté bajo</p>
            </div>
          </div>
          {tiene(PERMISOS.SOLICITUDES_CREAR) && (
            <button type="button" onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-clinica-600 px-4 py-2 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" /> Nueva solicitud
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={crear} className="rounded-xl border bg-white p-5 space-y-3 shadow-sm">
            <select value={form.productoId} onChange={(e) => setForm({ ...form, productoId: e.target.value })} required className="w-full rounded-lg border px-3 py-2 text-sm">
              <option value="">Producto...</option>
              {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre} ({p.skuCode})</option>)}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input type="number" min={1} value={form.cantidad} onChange={(e) => setForm({ ...form, cantidad: parseInt(e.target.value, 10) })} required className="rounded-lg border px-3 py-2 text-sm" placeholder="Cantidad" />
              <select value={form.prioridad} onChange={(e) => setForm({ ...form, prioridad: e.target.value })} className="rounded-lg border px-3 py-2 text-sm">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
                <option value="urgente">Urgente</option>
              </select>
            </div>
            <input value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} required minLength={3} placeholder="Motivo" className="w-full rounded-lg border px-3 py-2 text-sm" />
            <button type="submit" className="w-full rounded-lg bg-clinica-600 py-2 text-sm font-semibold text-white">Enviar</button>
          </form>
        )}

        <div className="flex flex-wrap gap-2">
          {['', 'pendiente', 'aprobada', 'rechazada', 'surtida'].map((e) => (
            <button key={e} type="button" onClick={() => setFiltro(e)} className={`rounded-lg px-3 py-1.5 text-sm capitalize ${filtro === e ? 'bg-clinica-600 text-white' : 'bg-slate-100'}`}>
              {e || 'Todas'}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {solicitudes.length === 0 ? (
            <p className="text-center text-slate-400 py-8">No hay solicitudes</p>
          ) : solicitudes.map((s) => (
            <div key={s.id} className="rounded-xl border bg-white p-4 shadow-sm">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <p className="font-medium">{s.producto.nombre}</p>
                  <p className="text-xs text-slate-500">{s.producto.skuCode} · Stock: {s.producto.stockActual}</p>
                  <p className="mt-1 text-sm">{s.motivo}</p>
                  <p className="text-xs text-slate-400">{s.usuario.nombre} · {new Date(s.createdAt).toLocaleString('es-CO')}</p>
                </div>
                <div className="text-right">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                    s.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                    s.estado === 'surtida' ? 'bg-green-100 text-green-800' :
                    s.estado === 'aprobada' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                  }`}>{s.estado}</span>
                  <p className="mt-1 text-sm">×{s.cantidadSolicitada} · {s.prioridad}</p>
                  {tiene(PERMISOS.SOLICITUDES_GESTIONAR) && s.estado === 'pendiente' && (
                    <div className="mt-2 flex gap-2 justify-end">
                      <button type="button" onClick={() => gestionar(s.id, 'aprobada')} className="rounded bg-green-100 p-1.5 text-green-700"><Check className="h-4 w-4" /></button>
                      <button type="button" onClick={() => gestionar(s.id, 'rechazada')} className="rounded bg-red-100 p-1.5 text-red-700"><X className="h-4 w-4" /></button>
                      <button type="button" onClick={() => gestionar(s.id, 'surtida')} className="rounded bg-clinica-100 px-2 py-1 text-xs text-clinica-700">Surtida</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ClientLayout>
  );
}
