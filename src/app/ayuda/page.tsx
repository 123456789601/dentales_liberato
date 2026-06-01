'use client';

import { ClientLayout } from '@/components/ClientLayout';
import { useSession } from '@/hooks/useSession';
import { HelpCircle, Shield, Package, AlertTriangle, ClipboardList, FileBarChart } from 'lucide-react';

const SECCIONES = [
  { icon: Package, titulo: 'Inventario', texto: 'Consulte stock, busque por SKU o nombre, filtre por categoría. Semáforo: verde óptimo, amarillo por vencer (30d), rojo crítico o vencido.' },
  { icon: AlertTriangle, titulo: 'Movimientos', texto: 'Registre salidas de consumo con motivo y referencia de paciente. El historial guarda stock anterior y posterior para auditoría.' },
  { icon: ClipboardList, titulo: 'Solicitudes', texto: 'Cuando un insumo esté bajo, cree una solicitud de reposición con prioridad. El administrador la aprueba o surte.' },
  { icon: FileBarChart, titulo: 'Reportes', texto: 'Vea el top de consumo del mes y exporte CSV (admin). Lleve control de qué se usa más en la clínica.' },
  { icon: Shield, titulo: 'Roles y permisos', texto: 'Los permisos están en tablas separadas (roles, permisos, rol_permisos). Cada usuario solo ve y hace lo que su rol permite.' },
];

export default function AyudaPage() {
  const { user, loading } = useSession();
  if (loading || !user) return <div className="flex min-h-screen items-center justify-center">Cargando...</div>;

  return (
    <ClientLayout>
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-3">
          <HelpCircle className="h-8 w-8 text-clinica-600" />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Manual de usuario</h1>
            <p className="text-sm text-slate-500">Dentales Liberato — Guía para {user.rolNombre}</p>
          </div>
        </div>
        <div className="space-y-4">
          {SECCIONES.map((s) => {
            const Icon = s.icon;
            return (
              <article key={s.titulo} className="rounded-xl border bg-white p-5 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <Icon className="h-5 w-5 text-clinica-600" />
                  <h2 className="font-semibold">{s.titulo}</h2>
                </div>
                <p className="text-sm leading-relaxed text-slate-600">{s.texto}</p>
              </article>
            );
          })}
        </div>
      </div>
    </ClientLayout>
  );
}
