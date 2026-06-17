'use client';

import { useEffect, useState } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { MovementForm } from '@/components/MovementForm';
import { MovementHistory } from '@/components/MovementHistory';
import { useSession } from '@/hooks/useSession';
import { PERMISOS } from '@/lib/permissions';
import { ArrowLeftRight, History, Plus, SlidersHorizontal, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Tab = 'salida' | 'entrada' | 'ajuste' | 'historial';

export default function MovimientosPage() {
  const router = useRouter();
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

  const tabs: { id: Tab; label: string; icon: any; show: boolean }[] = [
    { id: 'salida', label: 'Salida', icon: ArrowLeftRight, show: tiene(PERMISOS.MOVIMIENTOS_SALIDA) },
    { id: 'entrada', label: 'Entrada', icon: Plus, show: tiene(PERMISOS.MOVIMIENTOS_ENTRADA) },
    { id: 'ajuste', label: 'Ajuste', icon: SlidersHorizontal, show: tiene(PERMISOS.MOVIMIENTOS_AJUSTE) },
    { id: 'historial', label: 'Historial', icon: History, show: tiene(PERMISOS.MOVIMIENTOS_VER) },
  ];

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Movimientos de inventario</h1>
            <p className="text-sm text-slate-500">Registre entradas, salidas, ajustes y consulte el historial</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {tabs.filter((t) => t.show).map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition ${
                  tab === t.id
                    ? 'border-clinica-600 bg-clinica-50 text-clinica-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{t.label}</span>
              </button>
            );
          })}
        </div>

        {tab === 'historial' ? (
          <MovementHistory key={refresh} />
        ) : (
          <div className="max-w-2xl">
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
