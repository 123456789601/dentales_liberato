'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save, Upload, Image as ImageIcon, DollarSign, Package, Calendar, FileText, User } from 'lucide-react';

interface Caso {
  id: number;
  codigo: string;
  descripcion: string;
  estado: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  valorTotal: number;
  costoMateriales: number;
  gananciaProyectada: number;
  fechaEntrega: string;
  fechaInicio: string;
  fechaCompletado?: string;
  notas?: string;
  imagen?: string;
  faseId?: number;
  clinica?: string;
  paciente: {
    id: number;
    nombre: string;
    odontologo?: string;
  };
  fase?: {
    id: number;
    nombre: string;
    color?: string;
  };
  materiales: Array<{
    id: number;
    producto: {
      id: number;
      nombre: string;
      sku: string;
    };
    cantidad: number;
    costoUnitario: number;
    costoTotal: number;
  }>;
  abonos: Array<{
    id: number;
    monto: number;
    fecha: string;
    metodo?: string;
  }>;
}

interface FaseCaso {
  id: number;
  nombre: string;
  color?: string;
  orden: number;
}

export default function EditarCasoPage() {
  const params = useParams();
  const router = useRouter();
  const casoId = parseInt(params.id as string);

  const [caso, setCaso] = useState<Caso | null>(null);
  const [fases, setFases] = useState<FaseCaso[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);

  const [formData, setFormData] = useState({
    descripcion: '',
    estado: 'pendiente' as 'pendiente' | 'en_progreso' | 'completado' | 'cancelado',
    valorTotal: '',
    fechaEntrega: '',
    notas: '',
    imagen: '',
    faseId: '',
    clinica: '',
  });

  useEffect(() => {
    cargarCaso();
    cargarFases();
  }, [casoId]);

  const cargarCaso = async () => {
    try {
      const res = await fetch(`/api/casos/${casoId}`);
      if (res.ok) {
        const data = await res.json();
        setCaso(data);
        setFormData({
          descripcion: data.descripcion || '',
          estado: data.estado || 'pendiente',
          valorTotal: data.valorTotal || '',
          fechaEntrega: data.fechaEntrega ? data.fechaEntrega.split('T')[0] : '',
          notas: data.notas || '',
          imagen: data.imagen || '',
          faseId: data.faseId ? data.faseId.toString() : '',
          clinica: data.clinica || '',
        });
      }
    } catch (error) {
      console.error('Error al cargar caso:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarFases = async () => {
    try {
      const res = await fetch('/api/fases-casos');
      if (res.ok) {
        const data = await res.json();
        setFases(data);
      }
    } catch (error) {
      console.error('Error al cargar fases:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setGuardando(true);

    try {
      const res = await fetch(`/api/casos/${casoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          descripcion: formData.descripcion,
          estado: formData.estado,
          valorTotal: parseFloat(formData.valorTotal) || 0,
          fechaEntrega: formData.fechaEntrega ? new Date(formData.fechaEntrega) : null,
          notas: formData.notas,
          imagen: formData.imagen,
          faseId: formData.faseId ? parseInt(formData.faseId) : null,
          clinica: formData.clinica,
        }),
      });

      if (res.ok) {
        router.push('/casos');
      }
    } catch (error) {
      console.error('Error al actualizar caso:', error);
    } finally {
      setGuardando(false);
    }
  };

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(monto);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!caso) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Caso no encontrado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Editar Caso {caso.codigo}</h1>
          <p className="mt-1 text-sm text-gray-500">Paciente: {caso.paciente.nombre}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información básica */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Información Básica
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value as any })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pendiente">Pendiente</option>
                  <option value="en_progreso">En Progreso</option>
                  <option value="completado">Completado</option>
                  <option value="cancelado">Cancelado</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valor Total</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.valorTotal}
                    onChange={(e) => setFormData({ ...formData, valorTotal: e.target.value })}
                    step="0.01"
                    min="0"
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Entrega</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    value={formData.fechaEntrega}
                    onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 pl-10 pr-3 py-2 focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fase</label>
                <select
                  value={formData.faseId}
                  onChange={(e) => setFormData({ ...formData, faseId: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sin fase asignada</option>
                  {fases.map((fase) => (
                    <option key={fase.id} value={fase.id}>
                      {fase.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Clínica de Origen</label>
                <input
                  type="text"
                  value={formData.clinica}
                  onChange={(e) => setFormData({ ...formData, clinica: e.target.value })}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Nombre de la clínica"
                />
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                rows={2}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                placeholder="Notas adicionales..."
              />
            </div>
          </div>

          {/* Imagen */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Imagen del Caso
            </h2>
            <div className="space-y-4">
              {formData.imagen && (
                <div className="relative inline-block">
                  <img
                    src={formData.imagen}
                    alt="Imagen del caso"
                    className="max-w-full h-auto rounded-lg border border-gray-300"
                    style={{ maxHeight: '300px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, imagen: '' })}
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">URL de la Imagen</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.imagen}
                    onChange={(e) => setFormData({ ...formData, imagen: e.target.value })}
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="https://ejemplo.com/imagen.jpg"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Ingresa la URL de la imagen del caso (puede ser de una carpeta pública o un servicio de almacenamiento)
                </p>
              </div>
            </div>
          </div>

          {/* Resumen financiero */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Resumen Financiero
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Valor Total</p>
                <p className="text-xl font-bold text-gray-900">{formatearMoneda(caso.valorTotal)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Costo Materiales</p>
                <p className="text-xl font-bold text-gray-900">{formatearMoneda(caso.costoMateriales)}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Ganancia Proyectada</p>
                <p className="text-xl font-bold text-green-600">{formatearMoneda(caso.gananciaProyectada)}</p>
              </div>
            </div>
          </div>

          {/* Materiales */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Package className="w-5 h-5" />
              Materiales ({caso.materiales.length})
            </h2>
            {caso.materiales.length === 0 ? (
              <p className="text-gray-500">No hay materiales asignados</p>
            ) : (
              <div className="space-y-2">
                {caso.materiales.map((material) => (
                  <div key={material.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{material.producto.nombre}</p>
                      <p className="text-sm text-gray-500">SKU: {material.producto.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">{material.cantidad} unidades</p>
                      <p className="text-sm text-gray-500">{formatearMoneda(material.costoTotal)}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Abonos */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Abonos ({caso.abonos.length})
            </h2>
            {caso.abonos.length === 0 ? (
              <p className="text-gray-500">No hay abonos registrados</p>
            ) : (
              <div className="space-y-2">
                {caso.abonos.map((abono) => (
                  <div key={abono.id} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Abono #{abono.id}</p>
                      <p className="text-sm text-gray-500">{new Date(abono.fecha).toLocaleDateString('es-CO')}</p>
                    </div>
                    <p className="font-bold text-green-600">{formatearMoneda(abono.monto)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Botones de acción */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={guardando}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {guardando ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
