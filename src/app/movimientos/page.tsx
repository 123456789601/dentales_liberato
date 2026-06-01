'use client';

import { useEffect, useState } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { MovementForm } from '@/components/MovementForm';
import { MovementHistory } from '@/components/MovementHistory';
import { useSession } from '@/hooks/useSession';
import { PERMISOS } from '@/lib/permissions';

type Tab = 'salida' | 'entrada' | 'ajuste' | 'historial';

export default function MovimientosPage() {
  const { user, loading, tiene } = useSession();
  const [tab, setTab] = useState<Tab>('salida');
  const [productos, setProductos] = useState<{ id: number; nombre: string; skuCode: string; stockActual: number }[]>([]);
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    fetch('/api/productos?limit=200')
      .then((r) => r.json())
      .then((d) => setProductos(d.data ?? []));
  }, [refresh]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;
  }

  const tabs: { id: Tab; label: string; show: boolean }[] = [
    { id: 'salida', label: 'Salida (consumo)', show: tiene(PERMISOS.MOVIMIENTOS_SALIDA) },
    { id: 'entrada', label: 'Entrada (compra)', show: tiene(PERMISOS.MOVIMIENTOS_ENTRADA) },
    { id: 'ajuste', label: 'Ajuste', show: tiene(PERMISOS.MOVIMIENTOS_AJUSTE) },
    { id: 'historial', label: 'Historial', show: tiene(PERMISOS.MOVIMIENTOS_VER) },
  ];

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Movimientos de inventario</h1>
          <p className="text-sm text-slate-500">Registre entradas, salidas y consulte el historial completo</p>
        </div>

        <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
          {tabs.filter((t) => t.show).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                tab === t.id ? 'bg-clinica-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === 'historial' ? (
          <MovementHistory key={refresh} />
        ) : (
          <div className="max-w-lg">
            <MovementForm
              tipo={tab === 'salida' ? 'Salida' : tab === 'entrada' ? 'Entrada' : 'Ajuste'}
              productos={productos}
              onSuccess={() => setRefresh((r) => r + 1)}
            />
          </div>
        )}
      </div>
    </ClientLayout>
  );
}
