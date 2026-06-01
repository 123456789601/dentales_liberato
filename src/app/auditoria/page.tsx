'use client';

import { useEffect, useState } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { formatDate } from '@/lib/format';
import { ScrollText } from 'lucide-react';

export default function AuditoriaPage() {
  const [logs, setLogs] = useState<{ id: number; accion: string; entidad: string; detalle: string | null; createdAt: string; usuario: { nombre: string } | null }[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetch(`/api/auditoria?page=${page}`).then((r) => r.json()).then((d) => {
      setLogs(d.data ?? []);
      setTotalPages(d.pagination?.totalPages ?? 1);
    });
  }, [page]);

  return (
    <ClientLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ScrollText className="h-7 w-7 text-clinica-600" /> Auditoría del sistema</h1>
        <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Fecha</th>
                <th className="px-4 py-3">Usuario</th>
                <th className="px-4 py-3">Acción</th>
                <th className="px-4 py-3">Entidad</th>
                <th className="px-4 py-3">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {logs.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50">
                  <td className="px-4 py-2 whitespace-nowrap">{formatDate(l.createdAt)}</td>
                  <td className="px-4 py-2">{l.usuario?.nombre ?? 'Sistema'}</td>
                  <td className="px-4 py-2 font-mono text-xs">{l.accion}</td>
                  <td className="px-4 py-2">{l.entidad}</td>
                  <td className="px-4 py-2 text-slate-500 truncate max-w-xs">{l.detalle}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-center gap-2">
          <button type="button" disabled={page <= 1} onClick={() => setPage(page - 1)} className="rounded border px-3 py-1 text-sm disabled:opacity-40">Anterior</button>
          <span className="text-sm text-slate-500">Página {page} de {totalPages}</span>
          <button type="button" disabled={page >= totalPages} onClick={() => setPage(page + 1)} className="rounded border px-3 py-1 text-sm disabled:opacity-40">Siguiente</button>
        </div>
      </div>
    </ClientLayout>
  );
}
