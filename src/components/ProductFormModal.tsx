'use client';

import { useState, FormEvent, useEffect } from 'react';
import { X } from 'lucide-react';

interface Categoria { id: number; nombre: string }

export interface ProductoEdit {
  id?: number;
  nombre: string;
  descripcion?: string;
  skuCode: string;
  stockActual?: number;
  stockMinimo: number;
  precioUnitario?: number;
  fechaVencimiento?: string;
  ubicacionBodega?: string;
  categoriaId: number;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  producto?: ProductoEdit | null;
  puedePrecio: boolean;
}

export function ProductFormModal({ open, onClose, onSaved, producto, puedePrecio }: Props) {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [form, setForm] = useState<ProductoEdit>({
    nombre: '', skuCode: '', stockMinimo: 5, categoriaId: 0, stockActual: 0, precioUnitario: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/categorias').then((r) => r.json()).then((d) => setCategorias(d.data ?? []));
  }, []);

  useEffect(() => {
    if (producto) {
      setForm({
        ...producto,
        fechaVencimiento: producto.fechaVencimiento
          ? new Date(producto.fechaVencimiento).toISOString().slice(0, 10)
          : '',
      });
    } else {
      setForm({ nombre: '', skuCode: '', stockMinimo: 5, categoriaId: 0, stockActual: 0, precioUnitario: 0 });
    }
  }, [producto, open]);

  if (!open) return null;

  async function submit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');
    const url = producto?.id ? `/api/productos/${producto.id}` : '/api/productos';
    const res = await fetch(url, {
      method: producto?.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, fechaVencimiento: form.fechaVencimiento || null }),
    });
    setLoading(false);
    if (!res.ok) {
      const d = await res.json();
      setError(d.error ?? 'Error al guardar');
      return;
    }
    onSaved();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">{producto?.id ? 'Editar producto' : 'Nuevo producto'}</h2>
          <button type="button" onClick={onClose} aria-label="Cerrar"><X className="h-5 w-5" /></button>
        </div>
        <form onSubmit={submit} className="mt-4 space-y-3">
          <InputField label="Nombre *" value={form.nombre} onChange={(v) => setForm({ ...form, nombre: v })} required />
          <InputField label="SKU *" value={form.skuCode} onChange={(v) => setForm({ ...form, skuCode: v })} required disabled={!!producto?.id} />
          <div>
            <label className="text-sm font-medium">Categoría *</label>
            <select value={form.categoriaId} onChange={(e) => setForm({ ...form, categoriaId: parseInt(e.target.value, 10) })} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm">
              <option value={0}>Seleccionar...</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {!producto?.id && (
              <InputField label="Stock inicial" type="number" value={String(form.stockActual ?? 0)} onChange={(v) => setForm({ ...form, stockActual: parseInt(v, 10) })} />
            )}
            <InputField label="Stock mínimo *" type="number" value={String(form.stockMinimo)} onChange={(v) => setForm({ ...form, stockMinimo: parseInt(v, 10) })} required />
          </div>
          {puedePrecio && (
            <InputField label="Precio unitario" type="number" value={String(form.precioUnitario ?? 0)} onChange={(v) => setForm({ ...form, precioUnitario: parseFloat(v) })} />
          )}
          <InputField label="Ubicación bodega" value={form.ubicacionBodega ?? ''} onChange={(v) => setForm({ ...form, ubicacionBodega: v })} />
          <FechaField value={form.fechaVencimiento ?? ''} onChange={(v) => setForm({ ...form, fechaVencimiento: v })} />
          <DescripcionField value={form.descripcion ?? ''} onChange={(v) => setForm({ ...form, descripcion: v })} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-clinica-600 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
            {loading ? 'Guardando...' : 'Guardar producto'}
          </button>
        </form>
      </div>
    </div>
  );
}

function InputField({ label, value, onChange, type = 'text', required, disabled }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; required?: boolean; disabled?: boolean;
}) {
  return (
    <div>
      <label className="text-sm font-medium">{label}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} required={required} disabled={disabled}
        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm disabled:bg-slate-100" />
    </div>
  );
}

function FechaField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium">Vencimiento</label>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
    </div>
  );
}

function DescripcionField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <label className="text-sm font-medium">Descripción</label>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
    </div>
  );
}
