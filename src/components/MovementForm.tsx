'use client';

import { useState, FormEvent } from 'react';
import { Loader2 } from 'lucide-react';

interface ProductoOption {
  id: number;
  nombre: string;
  skuCode: string;
  stockActual: number;
}

interface MovementFormProps {
  tipo: 'Entrada' | 'Salida' | 'Ajuste';
  productos: ProductoOption[];
  productoIdInicial?: number;
  onSuccess?: () => void;
}

export function MovementForm({ tipo, productos, productoIdInicial, onSuccess }: MovementFormProps) {
  const [productoId, setProductoId] = useState(String(productoIdInicial ?? ''));
  const [cantidad, setCantidad] = useState(tipo === 'Ajuste' ? 0 : 1);
  const [motivo, setMotivo] = useState('');
  const [referencia, setReferencia] = useState('');
  const [pacienteRef, setPacienteRef] = useState('');
  const [error, setError] = useState('');
  const [ok, setOk] = useState('');
  const [loading, setLoading] = useState(false);

  const productoSel = productos.find((p) => p.id === parseInt(productoId, 10));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setOk('');
    setLoading(true);

    const body: Record<string, unknown> = {
      productoId: parseInt(productoId, 10),
      tipo,
      cantidad: tipo === 'Ajuste' ? cantidad : cantidad,
      motivo,
      referencia: referencia || undefined,
      pacienteRef: pacienteRef || undefined,
    };

    const res = await fetch('/api/movimientos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? 'Error al registrar');
      return;
    }

    setOk(`${tipo} registrada correctamente`);
    setMotivo('');
    setReferencia('');
    setPacienteRef('');
    onSuccess?.();
  }

  const titulos = {
    Entrada: 'Registrar entrada (compra/recepción)',
    Salida: 'Registrar salida (consumo clínico)',
    Ajuste: 'Ajuste de inventario (stock real)',
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="font-semibold text-slate-800">{titulos[tipo]}</h3>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Producto *</label>
        <select
          value={productoId}
          onChange={(e) => setProductoId(e.target.value)}
          required
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        >
          <option value="">Seleccionar...</option>
          {productos.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nombre} ({p.skuCode}) — Stock: {p.stockActual}
            </option>
          ))}
        </select>
      </div>

      <CantidadField tipo={tipo} cantidad={cantidad} setCantidad={setCantidad} productoSel={productoSel} />

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Motivo *</label>
        <input
          value={motivo}
          onChange={(e) => setMotivo(e.target.value)}
          required
          minLength={3}
          placeholder={tipo === 'Salida' ? 'Ej: Endodoncia paciente P-042' : 'Ej: Compra factura #1234'}
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      {tipo === 'Salida' && (
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Referencia paciente</label>
          <input
            value={pacienteRef}
            onChange={(e) => setPacienteRef(e.target.value)}
            placeholder="ID o nombre del paciente"
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          />
        </div>
      )}

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Referencia documento</label>
        <input
          value={referencia}
          onChange={(e) => setReferencia(e.target.value)}
          placeholder="Factura, orden, etc."
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      {ok && <p className="text-sm text-green-600">{ok}</p>}

      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-lg bg-clinica-600 py-2.5 text-sm font-semibold text-white hover:bg-clinica-700 disabled:opacity-60"
      >
        {loading ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : `Registrar ${tipo.toLowerCase()}`}
      </button>
    </form>
  );
}

function CantidadField({
  tipo,
  cantidad,
  setCantidad,
  productoSel,
}: {
  tipo: string;
  cantidad: number;
  setCantidad: (n: number) => void;
  productoSel?: ProductoOption;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-slate-700">
        {tipo === 'Ajuste' ? 'Stock real (unidades)' : 'Cantidad *'}
      </label>
      <input
        type="number"
        min={tipo === 'Ajuste' ? 0 : 1}
        value={cantidad}
        onChange={(e) => setCantidad(parseInt(e.target.value, 10) || 0)}
        required
        className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
      />
      {tipo === 'Salida' && productoSel && cantidad > productoSel.stockActual && (
        <p className="mt-1 text-xs text-red-600">Stock insuficiente (disponible: {productoSel.stockActual})</p>
      )}
    </div>
  );
}
