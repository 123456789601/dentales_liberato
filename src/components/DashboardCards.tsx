'use client';

/**
 * Dentales Liberato - Tarjetas del dashboard principal
 */
import { Package, AlertTriangle, CalendarClock, DollarSign } from 'lucide-react';

interface Metrics {
  totalInsumos: number;
  alertasStock: number;
  productosPorVencer: number;
  valorTotalInventario: number | null;
  solicitudesPendientes?: number;
}

export function DashboardCards({ metrics, esAdmin }: { metrics: Metrics; esAdmin: boolean }) {
  const cards = [
    {
      title: 'Total Insumos',
      value: metrics.totalInsumos,
      icon: Package,
      color: 'text-clinica-600 bg-clinica-50',
      tooltip: 'Cantidad de productos activos en inventario',
      show: true,
    },
    {
      title: 'Alertas de Stock',
      value: metrics.alertasStock,
      icon: AlertTriangle,
      color: 'text-red-600 bg-red-50',
      tooltip: 'Productos en rojo: stock bajo o vencidos',
      show: true,
    },
    {
      title: 'Por Vencer (30 días)',
      value: metrics.productosPorVencer,
      icon: CalendarClock,
      color: 'text-yellow-600 bg-yellow-50',
      tooltip: 'Productos con vencimiento próximo',
      show: true,
    },
    {
      title: 'Valor Total en Bodega',
      value: metrics.valorTotalInventario,
      icon: DollarSign,
      color: 'text-emerald-600 bg-emerald-50',
      tooltip: 'Suma de stock × precio unitario (solo administrador)',
      show: esAdmin,
      format: (v: number) =>
        new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v),
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards
        .filter((c) => c.show)
        .map((card) => (
          <div
            key={card.title}
            title={card.tooltip}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md"
          >
            <CardHeader icon={card.icon} color={card.color} title={card.title} />
            <p className="mt-3 text-3xl font-bold text-slate-800">
              {card.format && typeof card.value === 'number'
                ? card.format(card.value)
                : card.value ?? '—'}
            </p>
          </div>
        ))}
    </div>
  );
}

function CardHeader({
  icon: Icon,
  color,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  title: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm font-medium text-slate-500">{title}</p>
      <div className={`rounded-lg p-2 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
  );
}
