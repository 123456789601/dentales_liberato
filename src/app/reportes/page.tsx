'use client';

import { useEffect, useState } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { useSession } from '@/hooks/useSession';
import { PERMISOS } from '@/lib/permissions';
import { formatMoney } from '@/lib/format';
import { Download, FileBarChart } from 'lucide-react';

export default function ReportesPage() {
  const { user, loading, tiene } = useSession();
  const [resumen, setResumen] = useState({ totalProductos: 0, valorTotal: 0, movimientosMes: 0, solicitudesPendientes: 0 });
  const [consumo, setConsumo] = useState<{ producto?: { nombre: string; skuCode: string }; totalConsumido: number }[]>([]);

  useEffect(() => {
    if (!loading && user) {
      fetch('/api/reportes/inventario').then((r) => r.json()).then(setResumen);
      fetch('/api/movimientos/resumen?dias=30').then((r) => r.json()).then((d) => setConsumo(d.data ?? []));
    }
  }, [loading, user]);

  if (loading || !user) return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Reportes</h1>
          <p className="text-sm text-slate-500">Exportación y análisis de inventario — Dentales Liberato</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Productos activos" value={String(resumen.totalProductos)} />
          {tiene(PERMISOS.DASHBOARD_VER_COSTOS) && (
            <Stat label="Valor en bodega" value={formatMoney(resumen.valorTotal)} />
          )}
          <Stat label="Movimientos este mes" value={String(resumen.movimientosMes)} />
          <Stat label="Solicitudes pendientes" value={String(resumen.solicitudesPendientes)} />
        </div>

        {tiene(PERMISOS.REPORTES_EXPORTAR) && (
          <div className="flex flex-wrap gap-3">
            <a href="/api/reportes/inventario?format=csv" className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
              <Download className="h-4 w-4" /> Exportar inventario (CSV)
            </a>
            <a href="/api/reportes/movimientos?dias=30" className="flex items-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">
              <Download className="h-4 w-4" /> Exportar movimientos 30d (CSV)
            </a>
          </div>
        )}

        <section className="rounded-xl border bg-white shadow-sm">
          <h2 className="flex items-center gap-2 border-b px-4 py-3 font-semibold">
            <FileBarChart className="h-5 w-5 text-clinica-600" />
            Top consumo (últimos 30 días)
          </h2>
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2">Producto</th>
                <th className="px-4 py-2">SKU</th>
                <th className="px-4 py-2">Unidades consumidas</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {consumo.length === 0 ? (
                <tr><td colSpan={3} className="px-4 py-6 text-center text-slate-400">Sin datos de consumo</td></tr>
              ) : consumo.map((c, i) => (
                <tr key={i}>
                  <td className="px-4 py-2">{c.producto?.nombre}</td>
                  <td className="px-4 py-2 font-mono text-slate-500">{c.producto?.skuCode}</td>
                  <td className="px-4 py-2 font-semibold">{c.totalConsumido}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>
    </ClientLayout>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}
