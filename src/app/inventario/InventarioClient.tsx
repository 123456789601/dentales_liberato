'use client';

import { useCallback, useEffect, useState } from 'react';
import { ClientLayout } from '@/components/ClientLayout';
import { InventoryTable } from '@/components/InventoryTable';
import { ProductFormModal, ProductoEdit } from '@/components/ProductFormModal';
import { PERMISOS } from '@/lib/permissions';
import { useSession } from '@/hooks/useSession';
import { Plus, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function InventarioClient() {
  const router = useRouter();
  const { user, loading, tiene } = useSession();
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<ProductoEdit | null>(null);

  const reload = useCallback(() => setRefreshKey((k) => k + 1), []);

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-slate-400">Cargando...</div>;
  }

  return (
    <ClientLayout>
      <div className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Inventario</h1>
              <p className="text-sm text-slate-500">Control completo de insumos — Dentales Liberato</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={reload} className="flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-slate-50">
              <RefreshCw className="h-4 w-4" /> Actualizar
            </button>
            {tiene(PERMISOS.PRODUCTOS_CREAR) && (
              <button
                type="button"
                onClick={() => { setEditProduct(null); setModalOpen(true); }}
                className="flex items-center gap-2 rounded-lg bg-clinica-600 px-4 py-2 text-sm font-semibold text-white hover:bg-clinica-700"
              >
                <Plus className="h-4 w-4" /> Nuevo producto
              </button>
            )}
          </div>
        </div>
        <InventoryTable
          key={refreshKey}
          esAdmin={tiene(PERMISOS.INVENTARIO_VER_COSTOS)}
          puedeEditar={tiene(PERMISOS.PRODUCTOS_EDITAR)}
          puedeEliminar={tiene(PERMISOS.PRODUCTOS_ELIMINAR)}
          puedeSolicitar={tiene(PERMISOS.SOLICITUDES_CREAR)}
          onEdit={(p) => {
            setEditProduct({
              id: p.id,
              nombre: p.nombre,
              skuCode: p.skuCode,
              stockMinimo: p.stockMinimo,
              precioUnitario: p.precioUnitario,
              fechaVencimiento: p.fechaVencimiento ?? undefined,
              categoriaId: p.categoria.id,
            });
            setModalOpen(true);
          }}
          onReload={reload}
        />
        <ProductFormModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          onSaved={reload}
          producto={editProduct}
          puedePrecio={tiene(PERMISOS.PRODUCTOS_EDITAR_PRECIO)}
        />
      </div>
    </ClientLayout>
  );
}
