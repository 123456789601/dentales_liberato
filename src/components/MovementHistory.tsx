'use client';

import { useEffect, useState } from 'react';
import { formatDate } from '@/lib/format';

interface Movimiento {
  id: number;
  tipo: string;
  cantidad: number;
  stockAnterior: number;
  stockPosterior: number;
  motivo: string;
  pacienteRef: string | null;
  referencia: string | null;
  fecha: string;
  producto: { nombre: string; skuCode: string };
  usuario: { nombre: string };
}

export function MovementHistory({ productoId }: { productoId?: number }) {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([]);
  const [loading, setLoading] = useState(true);
  const [tipo, setTipo] = useState('');
  const [desde, setDesde] = useState('');
  const [hasta, setHasta] = useState('');

  useEffect(() => {
    const params = new URLSearchParams({ limit: '50' });
    if (productoId) params.set('productoId', String(productoId));
    if (tipo) params.set('tipo', tipo);
    if (desde) params.set('desde', desde);
    if (hasta) params.set('hasta', hasta);

    setLoading(true);
    fetch(`/api/movimientos?${params}`)
      .then((r) => r.json())
      .then((d) => setMovimientos(d.data ?? []))
      .finally(() => setLoading(false));
  }, [productoId, tipo, desde, hasta]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <select value={tipo} onChange={(e) => setTipo(e.target.value)} className="rounded-lg border px-2 py-1.5 text-sm">
          <option value="">Todos los tipos</option>
          <option value="Entrada">Entrada</option>
          <option value="Salida">Salida</option>
          <option value="Ajuste">Ajuste</option>
        </select>
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className="rounded-lg border px-2 py-1.5 text-sm" />
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className="rounded-lg border px-2 py-1.5 text-sm" />
      </div>

      <div className="overflow-hidden rounded-xl border bg-white">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
            <tr>
              <th className="px-3 py-2">Fecha</th>
              <th className="px-3 py-2">Tipo</th>
              {!productoId && <th className="px-3 py-2">Producto</th>}
              <th className="px-3 py-2">Cant.</th>
              <th className="px-3 py-2">Stock</th>
              <th className="px-3 py-2">Motivo</th>
              <th className="px-3 py-2">Usuario</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {loading ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-400">Cargando...</td></tr>
            ) : movimientos.length === 0 ? (
              <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-400">Sin movimientos</td></tr>
            ) : (
              movimientos.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50">
                  <td className="px-3 py-2 whitespace-nowrap">{formatDate(m.fecha)}</td>
                  <td className="px-3 py-2">
                    <span className={`rounded px-1.5 py-0.5 text-xs font-medium ${
                      m.tipo === 'Entrada' ? 'bg-green-100 text-green-800' :
                      m.tipo === 'Salida' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'
                    }`}>{m.tipo}</span>
                  </td>
                  {!productoId && <td className="px-3 py-2">{m.producto.nombre}</td>}
                  <td className="px-3 py-2 font-mono">{m.cantidad}</td>
                  <td className="px-3 py-2 text-slate-500">{m.stockAnterior} → {m.stockPosterior}</td>
                  <td className="px-3 py-2 max-w-[200px] truncate" title={m.motivo}>{m.motivo}</td>
                  <td className="px-3 py-2">{m.usuario.nombre}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
