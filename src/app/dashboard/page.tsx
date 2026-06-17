'use client';

import { useEffect, useState } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { DashboardCards } from '@/components/DashboardCards';
import { useSession } from '@/hooks/useSession';
import { PERMISOS } from '@/lib/permissions';
import Link from 'next/link';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Package, ArrowLeftRight, AlertTriangle, ClipboardList, DollarSign, Users, FileText, Wallet } from 'lucide-react';

export default function DashboardPage() {
  const { user, loading, tiene } = useSession();
  const [metrics, setMetrics] = useState({
    totalInsumos: 0,
    alertasStock: 0,
    productosPorVencer: 0,
    solicitudesPendientes: 0,
    misMovimientosHoy: 0,
    valorTotalInventario: null as number | null,
  });
  const [financialMetrics, setFinancialMetrics] = useState({
    ingresos: 0,
    gastos: 0,
    saldo: 0,
    totalPorCobrar: 0,
    casosActivos: 0,
    pacientes: 0,
  });

  useEffect(() => {
    if (!loading && user) {
      fetch('/api/dashboard').then((r) => r.json()).then(setMetrics);
      fetch('/api/finanzas?accion=resumen').then((r) => r.json()).then(setFinancialMetrics);
    }
  }, [loading, user]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;
  }

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(monto);
  };

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard ERP</h1>
          <p className="text-sm text-slate-500">
            Bienvenido, {user.nombre} — {user.rolNombre}
          </p>
        </div>

        <DashboardCards
          metrics={{
            totalInsumos: metrics.totalInsumos,
            alertasStock: metrics.alertasStock,
            productosPorVencer: metrics.productosPorVencer,
            valorTotalInventario: metrics.valorTotalInventario,
          }}
          esAdmin={tiene(PERMISOS.DASHBOARD_VER_COSTOS)}
        />

        {/* Métricas financieras ERP */}
        {tiene(PERMISOS.FINANZAS_VER) && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <FinancialCard
              label="Ingresos"
              value={formatearMoneda(financialMetrics.ingresos)}
              icon={DollarSign}
              color="green"
            />
            <FinancialCard
              label="Gastos"
              value={formatearMoneda(financialMetrics.gastos)}
              icon={ArrowLeftRight}
              color="red"
            />
            <FinancialCard
              label="Saldo Neto"
              value={formatearMoneda(financialMetrics.saldo)}
              icon={Wallet}
              color="blue"
            />
            <FinancialCard
              label="Por Cobrar"
              value={formatearMoneda(financialMetrics.totalPorCobrar)}
              icon={FileText}
              color="yellow"
            />
          </div>
        )}

        {/* Métricas de casos y pacientes */}
        {tiene(PERMISOS.CASOS_VER) && (
          <div className="grid gap-4 sm:grid-cols-2">
            <MetricCard
              label="Casos Activos"
              value={financialMetrics.casosActivos}
              icon={FileText}
              href="/casos"
            />
            <MetricCard
              label="Pacientes"
              value={financialMetrics.pacientes}
              icon={Users}
              href="/pacientes"
            />
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink href="/inventario" icon={Package} label="Ver inventario" />
          <QuickLink href="/movimientos" icon={ArrowLeftRight} label="Registrar movimiento" />
          <QuickLink href="/alertas" icon={AlertTriangle} label={`Alertas (${metrics.alertasStock})`} />
          <QuickLink href="/solicitudes" icon={ClipboardList} label={`Solicitudes (${metrics.solicitudesPendientes})`} />
        </div>

        {/* Enlaces a nuevos módulos ERP */}
        {tiene(PERMISOS.CASOS_VER) || tiene(PERMISOS.FINANZAS_VER) ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tiene(PERMISOS.CASOS_VER) && (
              <QuickLink href="/casos" icon={FileText} label="Ver casos" />
            )}
            {tiene(PERMISOS.PACIENTES_VER) && (
              <QuickLink href="/pacientes" icon={Users} label="Ver pacientes" />
            )}
            {tiene(PERMISOS.FINANZAS_VER) && (
              <QuickLink href="/finanzas" icon={DollarSign} label="Ver finanzas" />
            )}
            {tiene(PERMISOS.ABONOS_VER) && (
              <QuickLink href="/abonos" icon={Wallet} label="Ver abonos" />
            )}
          </div>
        ) : null}

        <div className="rounded-xl border border-clinica-200 bg-clinica-50 p-4 text-sm text-clinica-800">
          {user.rolCodigo === 'tecnico_dental' ? (
            <>Hoy: <strong>{metrics.misMovimientosHoy}</strong> movimientos. <Link href="/conteos" className="underline font-medium">Conteo físico</Link> · <Link href="/movimientos" className="underline font-medium">Registrar salida</Link></>
          ) : (
            <><strong>{metrics.solicitudesPendientes}</strong> solicitudes pendientes · <Link href="/ordenes" className="underline">Órdenes</Link> · <Link href="/roles" className="underline">Roles</Link></>
          )}
        </div>
        <ActivityFeed />
      </div>
    </ClientLayout>
  );
}

function QuickLink({ href, icon: Icon, label }: { href: string; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md hover:border-clinica-200">
      <Icon className="h-5 w-5 text-clinica-600" />
      <span className="text-sm font-medium text-slate-700">{label}</span>
    </Link>
  );
}

function FinancialCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ComponentType<{ className?: string }>; color: 'green' | 'red' | 'blue' | 'yellow' }) {
  const colorClasses = {
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <div className="rounded-xl border bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colorClasses[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, href }: { label: string; value: number; icon: React.ComponentType<{ className?: string }>; href: string }) {
  return (
    <Link href={href} className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="p-3 bg-blue-100 rounded-full">
        <Icon className="h-5 w-5 text-blue-600" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </Link>
  );
}
