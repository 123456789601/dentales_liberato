'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ClientLayout } from '@/components/ClientLayout';
import { useSession } from '@/hooks/useSession';
import { PERMISOS } from '@/lib/permissions';
import { ArrowLeft, CheckCircle } from 'lucide-react';

interface Detalle {
  id: number;
  productoId: number;
  stockSistema: number;
  stockFisico: number | null;
  diferencia: number | null;
  producto: { nombre: string; skuCode: string };
}

export default function ConteoDetallePage() {
  const params = useParams();
  const id = params.id as string;
  const { tiene } = useSession();
  const [conteo, setConteo] = useState<{ id: number; estado: string; detalles: Detalle[] } | null>(null);
  const [filtro, setFiltro] = useState('');
  const [guardando, setGuardando] = useState<number | null>(null);

  const cargar = useCallback(() => {
    fetch(`/api/conteos/${id}`).then((r) => r.json()).then((d) => setConteo(d.data));
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  async function guardarFisico(productoId: number, stockFisico: number) {
    setGuardando(productoId);
    await fetch(`/api/conteos/${id}/detalle`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productoId, stockFisico }),
    });
    setGuardando(null);
    cargar();
  }

  async function cerrar(aplicarAjustes: boolean) {
    if (!confirm(aplicarAjustes ? '¿Cerrar y aplicar ajustes?' : '¿Cerrar sin ajustar?')) return;
    const res = await fetch(`/api/conteos/${id}/cerrar`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ aplicarAjustes }),
    });
    const data = await res.json();
    if (!res.ok) alert(data.error ?? 'Error');
    else { alert('Conteo completado'); cargar(); }
  }

  if (!conteo) {
    return <ClientLayout><p className="p-8 text-center">Cargando...</p></ClientLayout>;
  }

  const detalles = conteo.detalles.filter((d) =>
    !filtro || d.producto.nombre.toLowerCase().includes(filtro.toLowerCase()) || d.producto.skuCode.includes(filtro)
  );
  const contados = conteo.detalles.filter((d) => d.stockFisico !== null).length;
  const conDiferencia = conteo.detalles.filter((d) => d.diferencia !== null && d.diferencia !== 0).length;

  return (
    <ClientLayout>
      <div className="space-y-4">
        <Link href="/conteos" className="inline-flex items-center gap-1 text-sm text-clinica-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Volver a conteos
        </Link>
        <div className="flex flex-wrap justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Conteo #{conteo.id}</h1>
            <p className="text-sm text-slate-500">{contados}/{conteo.detalles.length} contados · {conDiferencia} diferencias</p>
          </div>
          {conteo.estado === 'en_progreso' && tiene(PERMISOS.CONTEOS_GESTIONAR) && (
            <div className="flex gap-2">
              <button type="button" onClick={() => cerrar(true)} className="rounded-lg bg-clinica-600 px-4 py-2 text-sm font-semibold text-white">Cerrar y ajustar</button>
              <button type="button" onClick={() => cerrar(false)} className="rounded-lg border px-4 py-2 text-sm">Solo cerrar</button>
            </div>
          )}
        </div>
        <input value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Buscar producto o SKU..." className="w-full max-w-md rounded-lg border px-3 py-2 text-sm" />
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm max-h-[65vh] overflow-y-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-3 py-2 text-left">Producto</th>
                <th className="px-3 py-2 text-center">Sistema</th>
                <th className="px-3 py-2 text-center">Físico</th>
                <th className="px-3 py-2 text-center">Dif.</th>
                <th className="px-3 py-2 w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {detalles.map((d) => (
                <FilaConteo key={d.id} detalle={d} editable={conteo.estado === 'en_progreso'} guardando={guardando === d.productoId} onGuardar={guardarFisico} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ClientLayout>
  );
}

function FilaConteo({ detalle: d, editable, guardando, onGuardar }: {
  detalle: Detalle; editable: boolean; guardando: boolean;
  onGuardar: (productoId: number, stock: number) => void;
}) {
  const [val, setVal] = useState(String(d.stockFisico ?? ''));
  return (
    <tr className={d.diferencia !== null && d.diferencia !== 0 ? 'bg-amber-50' : d.stockFisico !== null ? 'bg-green-50/50' : ''}>
      <td className="px-3 py-2">
        <p className="font-medium">{d.producto.nombre}</p>
        <p className="text-xs font-mono text-slate-400">{d.producto.skuCode}</p>
      </td>
      <td className="px-3 py-2 text-center">{d.stockSistema}</td>
      <td className="px-3 py-2 text-center">
        {editable ? (
          <input type="number" min={0} value={val} onChange={(e) => setVal(e.target.value)} className="w-20 rounded border px-2 py-1 text-center" />
        ) : (d.stockFisico ?? '—')}
      </td>
      <td className={`px-3 py-2 text-center font-semibold ${d.diferencia && d.diferencia !== 0 ? 'text-red-600' : 'text-slate-500'}`}>
        {d.diferencia ?? '—'}
      </td>
      <td className="px-3 py-2">
        {editable && (
          <button type="button" disabled={guardando || val === ''} onClick={() => onGuardar(d.productoId, parseInt(val, 10))}
            className="rounded bg-clinica-100 p-1.5 text-clinica-700 hover:bg-clinica-200 disabled:opacity-40">
            <CheckCircle className="h-4 w-4" />
          </button>
        )}
      </td>
    </tr>
  );
}
