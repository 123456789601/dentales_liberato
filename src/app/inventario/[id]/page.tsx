'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ClientLayout } from '@/components/ClientLayout';
import { MovementHistory } from '@/components/MovementHistory';
import { MovementForm } from '@/components/MovementForm';
import { useSession } from '@/hooks/useSession';
import { PERMISOS } from '@/lib/permissions';
import { formatDate, formatMoney } from '@/lib/format';
import { ArrowLeft, Package } from 'lucide-react';
import type { SemaforoEstado } from '@/lib/inventory';

const SEMAFORO: Record<SemaforoEstado, string> = { rojo: 'bg-red-100 text-red-800', amarillo: 'bg-yellow-100 text-yellow-800', verde: 'bg-green-100 text-green-800' };

export default function ProductoDetallePage() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);
  const { tiene } = useSession();
  const [producto, setProducto] = useState<Record<string, unknown> | null>(null);
  const [tab, setTab] = useState<'kardex' | 'salida'>('kardex');

  const cargar = useCallback(() => {
    fetch(`/api/productos/${id}`).then((r) => r.json()).then((d) => setProducto(d.data));
  }, [id]);

  useEffect(() => { cargar(); }, [cargar]);

  if (!producto) return <ClientLayout><p className="p-8 text-center">Cargando...</p></ClientLayout>;

  const p = producto as {
    nombre: string; skuCode: string; stockActual: number; stockMinimo: number;
    precioUnitario: number; fechaVencimiento: string | null; ubicacionBodega: string | null;
    semaforo: SemaforoEstado; diasParaVencer: number | null; valorEnBodega: number;
    categoria: { nombre: string }; descripcion?: string;
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <Link href="/inventario" className="inline-flex items-center gap-1 text-sm text-clinica-600 hover:underline">
          <ArrowLeft className="h-4 w-4" /> Inventario
        </Link>
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Package className="h-6 w-6 text-clinica-600" />
                <h1 className="text-2xl font-bold">{p.nombre}</h1>
                <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEMAFORO[p.semaforo]}`}>{p.semaforo}</span>
              </div>
              <p className="mt-1 font-mono text-slate-500">{p.skuCode} · {p.categoria.nombre}</p>
              {p.descripcion && <p className="mt-2 text-sm text-slate-600">{p.descripcion}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <Stat label="Stock" value={String(p.stockActual)} sub={`Mín. ${p.stockMinimo}`} />
              {tiene(PERMISOS.INVENTARIO_VER_COSTOS) && <Stat label="Precio" value={formatMoney(p.precioUnitario)} />}
              {tiene(PERMISOS.INVENTARIO_VER_COSTOS) && <Stat label="Valor bodega" value={formatMoney(p.valorEnBodega)} />}
              <Stat label="Vence" value={p.fechaVencimiento ? formatDate(p.fechaVencimiento) : 'N/A'} sub={p.diasParaVencer !== null ? `${p.diasParaVencer} días` : undefined} />
              {p.ubicacionBodega && <Stat label="Ubicación" value={p.ubicacionBodega} />}
            </div>
          </div>
        </div>
        <div className="flex gap-2 border-b">
          <TabBtn active={tab === 'kardex'} onClick={() => setTab('kardex')}>Kardex / Historial</TabBtn>
          {tiene(PERMISOS.MOVIMIENTOS_SALIDA) && <TabBtn active={tab === 'salida'} onClick={() => setTab('salida')}>Registrar salida</TabBtn>}
        </div>
        {tab === 'kardex' ? <MovementHistory productoId={id} /> : (
          <div className="max-w-lg">
            <MovementForm tipo="Salida" productos={[{ id, nombre: p.nombre, skuCode: p.skuCode, stockActual: p.stockActual }]} productoIdInicial={id} onSuccess={cargar} />
          </div>
        )}
      </div>
    </ClientLayout>
  );
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-lg font-bold">{value}</p>
      {sub && <p className="text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px ${active ? 'border-clinica-600 text-clinica-700' : 'border-transparent text-slate-500'}`}>
      {children}
    </button>
  );
}
