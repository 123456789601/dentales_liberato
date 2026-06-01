'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell } from 'lucide-react';

interface Notif { id: number; titulo: string; mensaje: string; leida: boolean; link: string | null }

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Notif[]>([]);
  const [noLeidas, setNoLeidas] = useState(0);

  function cargar() {
    fetch('/api/notificaciones').then((r) => r.json()).then((d) => {
      setItems(d.data ?? []);
      setNoLeidas(d.noLeidas ?? 0);
    });
  }

  useEffect(() => {
    cargar();
    const iv = setInterval(cargar, 60000);
    return () => clearInterval(iv);
  }, []);

  async function marcarTodas() {
    await fetch('/api/notificaciones', { method: 'PATCH' });
    cargar();
  }

  return (
    <div className="relative">
      <button type="button" onClick={() => setOpen(!open)} className="relative rounded-lg p-2 hover:bg-slate-100" aria-label="Notificaciones">
        <Bell className="h-5 w-5 text-slate-600" />
        {noLeidas > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
            {noLeidas > 9 ? '9+' : noLeidas}
          </span>
        )}
      </button>
      {open && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border bg-white shadow-xl">
          <div className="flex items-center justify-between border-b px-4 py-2">
            <span className="font-semibold text-sm">Notificaciones</span>
            {noLeidas > 0 && (
              <button type="button" onClick={marcarTodas} className="text-xs text-clinica-600">Marcar leídas</button>
            )}
          </div>
          <div className="max-h-72 overflow-y-auto">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-center text-sm text-slate-400">Sin notificaciones</p>
            ) : items.map((n) => (
              <Link key={n.id} href={n.link ?? '#'} onClick={() => setOpen(false)}
                className={`block border-b px-4 py-3 text-sm hover:bg-slate-50 ${!n.leida ? 'bg-clinica-50/50' : ''}`}>
                <p className="font-medium">{n.titulo}</p>
                <p className="text-xs text-slate-500 line-clamp-2">{n.mensaje}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
