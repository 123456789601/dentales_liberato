'use client';

/**
 * Dentales Liberato - Tabla de inventario
 * Búsqueda en tiempo real, filtros por categoría, paginación y semáforo de alertas
 */
import { useCallback, useEffect, useState } from 'react';
import {
  Search, Package, ChevronLeft, ChevronRight, HelpCircle, AlertTriangle,
  Pencil, Trash2, ClipboardList, ArrowDownCircle,
} from 'lucide-react';
import Link from 'next/link';
import type { SemaforoEstado } from '@/lib/inventory';

interface Categoria {
  id: number;
  nombre: string;
}

interface ProductoRow {
  id: number;
  nombre: string;
  skuCode: string;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number;
  fechaVencimiento: string | null;
  semaforo: SemaforoEstado;
  diasParaVencer: number | null;
  valorEnBodega: number;
  categoria: { id: number; nombre: string };
}

interface InventoryTableProps {
  esAdmin: boolean;
  puedeEditar?: boolean;
  puedeEliminar?: boolean;
  puedeSolicitar?: boolean;
  onEdit?: (p: ProductoRow) => void;
  onReload?: () => void;
}

const SEMAFORO_STYLES: Record<SemaforoEstado, string> = {
  rojo: 'bg-red-100 text-red-800 border-red-200',
  amarillo: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  verde: 'bg-green-100 text-green-800 border-green-200',
};

const SEMAFORO_LABEL: Record<SemaforoEstado, string> = {
  rojo: 'Crítico',
  amarillo: 'Por vencer',
  verde: 'Óptimo',
};

export function InventoryTable({
  esAdmin,
  puedeEditar,
  puedeEliminar,
  puedeSolicitar,
  onEdit,
  onReload,
}: InventoryTableProps) {
  const [productos, setProductos] = useState<ProductoRow[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [q, setQ] = useState('');
  const [categoriaId, setCategoriaId] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const cargar = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '10' });
    if (q) params.set('q', q);
    if (categoriaId) params.set('categoriaId', categoriaId);

    const [resProd, resCat] = await Promise.all([
      fetch(`/api/productos?${params}`),
      fetch('/api/categorias'),
    ]);

    if (resProd.ok) {
      const json = await resProd.json();
      setProductos(json.data);
      setTotalPages(json.pagination.totalPages);
    }
    if (resCat.ok) {
      const json = await resCat.json();
      setCategorias(json.data);
    }
    setLoading(false);
  }, [q, categoriaId, page]);

  useEffect(() => {
    const timer = setTimeout(cargar, 300);
    return () => clearTimeout(timer);
  }, [cargar]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por nombre, SKU..."
            title="Búsqueda en tiempo real del inventario Dentales Liberato"
            className="w-full rounded-lg border border-slate-200 py-2 pl-10 pr-4 text-sm focus:border-clinica-500 focus:outline-none focus:ring-2 focus:ring-clinica-200"
          />
        </div>

        <select
          value={categoriaId}
          onChange={(e) => {
            setCategoriaId(e.target.value);
            setPage(1);
          }}
          title="Filtrar insumos por categoría clínica"
          className="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-clinica-500 focus:outline-none"
        >
          <option value="">Todas las categorías</option>
          {categorias.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <Th tooltip="Estado según stock y fecha de vencimiento">Estado</Th>
              <Th tooltip="Nombre del insumo odontológico">Producto</Th>
              <Th tooltip="Código único de inventario">SKU</Th>
              <Th tooltip="Categoría clínica">Categoría</Th>
              <Th tooltip="Unidades disponibles en bodega">Stock</Th>
              {esAdmin && <Th tooltip="Precio por unidad (solo administrador)">Precio</Th>}
              <Th tooltip="Fecha límite de uso del producto">Vencimiento</Th>
              <Th tooltip="Acciones">Acciones</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={esAdmin ? 8 : 7} className="px-4 py-12 text-center text-slate-400">
                  Cargando inventario...
                </td>
              </tr>
            ) : productos.length === 0 ? (
              <tr>
                <td colSpan={esAdmin ? 8 : 7} className="px-4 py-12 text-center text-slate-400">
                  <Package className="mx-auto mb-2 h-8 w-8 opacity-40" />
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              productos.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition">
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${SEMAFORO_STYLES[p.semaforo]}`}
                      title={`Semáforo: ${SEMAFORO_LABEL[p.semaforo]}`}
                    >
                      {p.semaforo === 'rojo' && <AlertTriangle className="h-3 w-3" />}
                      {SEMAFORO_LABEL[p.semaforo]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-slate-800">{p.nombre}</td>
                  <td className="px-4 py-3 text-sm text-slate-500 font-mono">{p.skuCode}</td>
                  <td className="px-4 py-3 text-sm text-slate-600">{p.categoria.nombre}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className={p.stockActual <= p.stockMinimo ? 'font-semibold text-red-600' : ''}>
                      {p.stockActual}
                    </span>
                    <span className="text-slate-400"> / mín. {p.stockMinimo}</span>
                  </td>
                  {esAdmin && (
                    <td className="px-4 py-3 text-sm text-slate-700">
                      ${p.precioUnitario.toLocaleString('es-CO')}
                    </td>
                  )}
                  <td className="px-4 py-3 text-sm text-slate-600">
                    {p.fechaVencimiento
                      ? new Date(p.fechaVencimiento).toLocaleDateString('es-CO')
                      : '—'}
                    {p.diasParaVencer !== null && p.diasParaVencer <= 30 && p.diasParaVencer >= 0 && (
                      <span className="ml-1 text-xs text-yellow-700">({p.diasParaVencer}d)</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Link href={`/movimientos?producto=${p.id}`} title="Registrar salida" className="rounded p-1.5 text-orange-600 hover:bg-orange-50">
                        <ArrowDownCircle className="h-4 w-4" />
                      </Link>
                      {puedeEditar && onEdit && (
                        <button type="button" onClick={() => onEdit(p)} title="Editar" className="rounded p-1.5 text-clinica-600 hover:bg-clinica-50">
                          <Pencil className="h-4 w-4" />
                        </button>
                      )}
                      {puedeEliminar && (
                        <button type="button" onClick={async () => {
                          if (confirm('¿Desactivar este producto?')) {
                            await fetch(`/api/productos/${p.id}`, { method: 'DELETE' });
                            onReload?.();
                          }
                        }} title="Eliminar" className="rounded p-1.5 text-red-600 hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                      {puedeSolicitar && (
                        <Link href={`/solicitudes?producto=${p.id}`} title="Solicitar reposición" className="rounded p-1.5 text-purple-600 hover:bg-purple-50">
                          <ClipboardList className="h-4 w-4" />
                        </Link>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}

function Th({ children, tooltip }: { children: React.ReactNode; tooltip: string }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
      <span className="inline-flex items-center gap-1" title={tooltip}>
        {children}
        <HelpCircle className="h-3.5 w-3.5 text-slate-300" />
      </span>
    </th>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <p className="text-sm text-slate-500">
        Página {page} de {totalPages || 1}
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 hover:bg-slate-50"
          title="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg border border-slate-200 p-2 disabled:opacity-40 hover:bg-slate-50"
          title="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
