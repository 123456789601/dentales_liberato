'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { formatDate } from '@/lib/format';
import { ArrowDownCircle, ArrowUpCircle, ClipboardList } from 'lucide-react';

export function ActivityFeed() {
  const [data, setData] = useState<{
    movimientos: { id: number; tipo: string; cantidad: number; fecha: string; motivo: string; producto: { nombre: string }; usuario: { nombre: string } }[];
    solicitudes: { id: number; motivo: string; producto: { nombre: string }; usuario: { nombre: string } }[];
  }>({ movimientos: [], solicitudes: [] });

  useEffect(() => {
    fetch('/api/actividad').then((r) => r.json()).then(setData);
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section className="rounded-xl border bg-white shadow-sm">
        <h3 className="border-b px-4 py-3 font-semibold text-sm">Últimos movimientos</h3>
        <ul className="divide-y max-h-80 overflow-y-auto">
          {data.movimientos.map((m) => (
            <li key={m.id} className="flex gap-3 px-4 py-3 text-sm">
              {m.tipo === 'Salida' ? <ArrowDownCircle className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" /> : <ArrowUpCircle className="h-4 w-4 text-green-500 shrink-0 mt-0.5" />}
              <div>
                <p className="font-medium">{m.producto.nombre}</p>
                <p className="text-xs text-slate-500">{m.tipo} ×{m.cantidad} · {m.usuario.nombre} · {formatDate(m.fecha)}</p>
                <p className="text-xs text-slate-400 truncate">{m.motivo}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/movimientos" className="block border-t px-4 py-2 text-center text-xs text-clinica-600 hover:bg-clinica-50">Ver todos →</Link>
      </section>
      <section className="rounded-xl border bg-white shadow-sm">
        <h3 className="border-b px-4 py-3 font-semibold text-sm">Solicitudes pendientes</h3>
        <ul className="divide-y">
          {data.solicitudes.length === 0 ? (
            <li className="px-4 py-6 text-center text-sm text-slate-400">Sin solicitudes pendientes</li>
          ) : data.solicitudes.map((s) => (
            <li key={s.id} className="flex gap-3 px-4 py-3 text-sm">
              <ClipboardList className="h-4 w-4 text-purple-500 shrink-0" />
              <div>
                <p className="font-medium">{s.producto.nombre}</p>
                <p className="text-xs text-slate-500">{s.usuario.nombre} — {s.motivo}</p>
              </div>
            </li>
          ))}
        </ul>
        <Link href="/solicitudes" className="block border-t px-4 py-2 text-center text-xs text-clinica-600 hover:bg-clinica-50">Gestionar →</Link>
      </section>
    </div>
  );
}
