'use client';

import { useEffect, useState } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { AlertTriangle, CalendarClock, Package, ArrowLeft } from 'lucide-react';
import { formatDate, formatMoney } from '@/lib/format';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import type { SemaforoEstado } from '@/lib/inventory';

interface ProductoAlerta {
  id: number;
  nombre: string;
  skuCode: string;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number;
  fechaVencimiento: string | null;
  diasParaVencer: number | null;
  semaforo: SemaforoEstado;
  ubicacionBodega: string | null;
  categoria: { nombre: string };
}

export default function AlertasPage() {
  const router = useRouter();
  const [criticos, setCriticos] = useState<ProductoAlerta[]>([]);
  const [porVencer, setPorVencer] = useState<ProductoAlerta[]>([]);
  const [resumen, setResumen] = useState({ criticos: 0, porVencer: 0, total: 0 });

  useEffect(() => {
    fetch('/api/alertas')
      .then((r) => r.json())
      .then((d) => {
        setCriticos(d.criticos ?? []);
        setPorVencer(d.porVencer ?? []);
        setResumen(d.resumen ?? {});
      });
  }, []);

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
            <h1 className="text-2xl font-bold text-slate-800">Alertas de inventario</h1>
            <p className="text-sm text-slate-500">Stock crítico y productos próximos a vencer</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card icon={Package} label="Total productos" value={resumen.total} color="text-clinica-600 bg-clinica-50" />
          <Card icon={AlertTriangle} label="Críticos" value={resumen.criticos} color="text-red-600 bg-red-50" />
          <Card icon={CalendarClock} label="Por vencer (30d)" value={resumen.porVencer} color="text-yellow-600 bg-yellow-50" />
        </div>

        <AlertSection title="Stock crítico o vencido" items={criticos} tipo="rojo" />
        <AlertSection title="Vencimiento en menos de 30 días" items={porVencer} tipo="amarillo" />
      </div>
    </ClientLayout>
  );
}

function Card({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className={`mb-2 inline-flex rounded-lg p-2 ${color}`}><Icon className="h-5 w-5" /></div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

function AlertSection({ title, items, tipo }: { title: string; items: ProductoAlerta[]; tipo: string }) {
  if (items.length === 0) return null;
  return (
    <section className="rounded-xl border bg-white shadow-sm">
      <h2 className="border-b px-4 py-3 font-semibold text-slate-800">{title} ({items.length})</h2>
      <div className="divide-y">
        {items.map((p) => (
          <div key={p.id} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
            <div>
              <p className="font-medium">{p.nombre}</p>
              <p className="text-xs text-slate-500">{p.skuCode} · {p.categoria.nombre} · {p.ubicacionBodega ?? 'Sin ubicación'}</p>
            </div>
            <div className="text-right text-sm">
              <p>Stock: <strong className={p.stockActual <= p.stockMinimo ? 'text-red-600' : ''}>{p.stockActual}</strong> / mín. {p.stockMinimo}</p>
              {p.fechaVencimiento && <p className="text-slate-500">Vence: {formatDate(p.fechaVencimiento)} ({p.diasParaVencer}d)</p>}
            </div>
            <Link href={`/movimientos?producto=${p.id}`} className="text-sm text-clinica-600 hover:underline">
              Registrar salida →
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
