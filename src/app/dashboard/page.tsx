'use client';

import { useEffect, useState } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { DashboardCards } from '@/components/DashboardCards';
import { useSession } from '@/hooks/useSession';
import { PERMISOS } from '@/lib/permissions';
import Link from 'next/link';
import { ActivityFeed } from '@/components/ActivityFeed';
import { Package, ArrowLeftRight, AlertTriangle, ClipboardList } from 'lucide-react';

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

  useEffect(() => {
    if (!loading && user) {
      fetch('/api/dashboard').then((r) => r.json()).then(setMetrics);
    }
  }, [loading, user]);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;
  }

  return (
    <ClientLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Dashboard</h1>
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <QuickLink href="/inventario" icon={Package} label="Ver inventario" />
          <QuickLink href="/movimientos" icon={ArrowLeftRight} label="Registrar movimiento" />
          <QuickLink href="/alertas" icon={AlertTriangle} label={`Alertas (${metrics.alertasStock})`} />
          <QuickLink href="/solicitudes" icon={ClipboardList} label={`Solicitudes (${metrics.solicitudesPendientes})`} />
        </div>

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
