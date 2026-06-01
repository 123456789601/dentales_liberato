'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Package, ArrowLeftRight } from 'lucide-react';

export function GlobalSearch() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<{ productos: { id: number; nombre: string; skuCode: string; stockActual: number }[]; movimientos: unknown[] }>({ productos: [], movimientos: [] });
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (q.length < 2) { setResults({ productos: [], movimientos: [] }); return; }
    const t = setTimeout(() => {
      fetch(`/api/buscar?q=${encodeURIComponent(q)}`)
        .then((r) => r.json())
        .then(setResults);
    }, 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const hasResults = results.productos.length > 0;

  return (
    <div ref={ref} className="relative w-full max-w-md">
      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder="Buscar SKU, producto..."
        className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-10 pr-4 text-sm focus:border-clinica-500 focus:bg-white focus:outline-none"
      />
      {open && q.length >= 2 && (
        <div className="absolute top-full z-50 mt-1 w-full rounded-xl border bg-white py-2 shadow-xl">
          {!hasResults ? (
            <p className="px-4 py-3 text-sm text-slate-400">Sin resultados</p>
          ) : (
            results.productos.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => { router.push(`/inventario/${p.id}`); setOpen(false); setQ(''); }}
                className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm hover:bg-slate-50"
              >
                <Package className="h-4 w-4 text-clinica-600 shrink-0" />
                <span>
                  <span className="font-medium">{p.nombre}</span>
                  <span className="ml-2 text-slate-400 font-mono text-xs">{p.skuCode}</span>
                  <span className="ml-2 text-slate-500">Stock: {p.stockActual}</span>
                </span>
              </button>
            ))
          )}
          <button
            type="button"
            onClick={() => { router.push(`/inventario?q=${encodeURIComponent(q)}`); setOpen(false); }}
            className="flex w-full items-center gap-2 border-t px-4 py-2 text-xs text-clinica-600 hover:bg-clinica-50"
          >
            <ArrowLeftRight className="h-3 w-3" /> Ver todos en inventario
          </button>
        </div>
      )}
    </div>
  );
}
