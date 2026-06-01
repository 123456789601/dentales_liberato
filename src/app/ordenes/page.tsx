'use client';

import { useEffect, useState, FormEvent } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { useSession } from '@/hooks/useSession';
import { PERMISOS } from '@/lib/permissions';
import { formatMoney } from '@/lib/format';
import { Plus, ShoppingCart } from 'lucide-react';

type OrdenItemForm = { productoId: string; cantidad: number; precio: number };

export default function OrdenesPage() {
  const { loading, tiene } = useSession();
  const [ordenes, setOrdenes] = useState<{ id: number; numero: string; estado: string; total: number; proveedor: { nombre: string }; createdAt: string }[]>([]);
  const [proveedores, setProveedores] = useState<{ id: number; nombre: string }[]>([]);
  const [productos, setProductos] = useState<{ id: number; nombre: string; skuCode: string; precioUnitario: number }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ proveedorId: string; items: OrdenItemForm[] }>({
    proveedorId: '',
    items: [{ productoId: '', cantidad: 1, precio: 0 }],
  });

  function cargar() {
    fetch('/api/ordenes').then((r) => r.json()).then((d) => setOrdenes(d.data ?? []));
  }

  useEffect(() => {
    if (!loading) {
      cargar();
      fetch('/api/proveedores').then((r) => r.json()).then((d) => setProveedores(d.data ?? []));
      fetch('/api/productos?limit=200').then((r) => r.json()).then((d) => setProductos(d.data ?? []));
    }
  }, [loading]);

  async function crear(e: FormEvent) {
    e.preventDefault();
    const detalles = form.items.filter((i) => i.productoId).map((i) => ({
      productoId: parseInt(i.productoId, 10),
      cantidad: i.cantidad,
      precioUnitario: i.precio,
    }));
    const res = await fetch('/api/ordenes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ proveedorId: parseInt(form.proveedorId, 10), detalles }),
    });
    if (res.ok) { setShowForm(false); cargar(); }
  }

  async function cambiarEstado(id: number, estado: string) {
    await fetch(`/api/ordenes/${id}/estado`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ estado }),
    });
    cargar();
  }

  if (loading) return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2"><ShoppingCart className="h-7 w-7 text-clinica-600" /> Órdenes de compra</h1>
            <p className="text-sm text-slate-500">Pedidos a proveedores con recepción automática de stock</p>
          </div>
          {tiene(PERMISOS.ORDENES_GESTIONAR) && (
            <button type="button" onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-clinica-600 px-4 py-2 text-sm font-semibold text-white">
              <Plus className="h-4 w-4" /> Nueva orden
            </button>
          )}
        </div>

        {showForm && (
          <form onSubmit={crear} className="rounded-xl border bg-white p-5 space-y-4 shadow-sm">
            <select value={form.proveedorId} onChange={(e) => setForm({ ...form, proveedorId: e.target.value })} required className="w-full rounded-lg border px-3 py-2 text-sm">
              <option value="">Proveedor...</option>
              {proveedores.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
            </select>
            {form.items.map((item, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-2">
                <select value={item.productoId} onChange={(e) => {
                  const items = [...form.items];
                  const current = items[idx];
                  if (!current) return;
                  const prod = productos.find((p) => p.id === parseInt(e.target.value, 10));
                  items[idx] = {
                    productoId: e.target.value,
                    cantidad: current.cantidad,
                    precio: prod ? Number(prod.precioUnitario) : 0,
                  };
                  setForm({ ...form, items });
                }} required className="col-span-2 rounded-lg border px-2 py-1.5 text-sm">
                  <option value="">Producto</option>
                  {productos.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
                </select>
                <input type="number" min={1} value={item.cantidad} onChange={(e) => {
                  const items = [...form.items];
                  const current = items[idx];
                  if (!current) return;
                  items[idx] = {
                    productoId: current.productoId,
                    cantidad: parseInt(e.target.value, 10) || 1,
                    precio: current.precio,
                  };
                  setForm({ ...form, items });
                }} className="rounded-lg border px-2 py-1.5 text-sm" placeholder="Cant." />
              </div>
            ))}
            <button type="button" onClick={() => setForm({ ...form, items: [...form.items, { productoId: '', cantidad: 1, precio: 0 }] })} className="text-sm text-clinica-600">+ Agregar línea</button>
            <button type="submit" className="w-full rounded-lg bg-clinica-600 py-2 text-sm font-semibold text-white">Crear orden</button>
          </form>
        )}

        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Número</th>
                <th className="px-4 py-3">Proveedor</th>
                <th className="px-4 py-3">Total</th>
                <th className="px-4 py-3">Estado</th>
                <th className="px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {ordenes.map((o) => (
                <tr key={o.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono font-medium">{o.numero}</td>
                  <td className="px-4 py-3">{o.proveedor.nombre}</td>
                  <td className="px-4 py-3">{formatMoney(Number(o.total))}</td>
                  <td className="px-4 py-3 capitalize"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{o.estado}</span></td>
                  <td className="px-4 py-3">
                    {tiene(PERMISOS.ORDENES_GESTIONAR) && o.estado === 'borrador' && (
                      <button type="button" onClick={() => cambiarEstado(o.id, 'enviada')} className="text-xs text-blue-600 mr-2">Enviar</button>
                    )}
                    {tiene(PERMISOS.ORDENES_GESTIONAR) && o.estado === 'enviada' && (
                      <button type="button" onClick={() => cambiarEstado(o.id, 'recibida')} className="text-xs text-green-600">Recibir (+stock)</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ClientLayout>
  );
}
