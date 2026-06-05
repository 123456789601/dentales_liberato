'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, GripVertical, Save, X, ArrowLeft } from 'lucide-react';

interface FaseCaso {
  id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  color?: string;
  activo: boolean;
}

export default function FasesCasosPage() {
  const router = useRouter();
  const [fases, setFases] = useState<FaseCaso[]>([]);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState<number | null>(null);
  const [nuevaFase, setNuevaFase] = useState(false);
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    color: '#3B82F6',
    orden: 0,
  });

  useEffect(() => {
    cargarFases();
  }, []);

  const cargarFases = async () => {
    try {
      const res = await fetch('/api/fases-casos');
      if (res.ok) {
        const data = await res.json();
        setFases(data);
      }
    } catch (error) {
      console.error('Error al cargar fases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/fases-casos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          orden: fases.length + 1,
        }),
      });

      if (res.ok) {
        setNuevaFase(false);
        setFormData({ nombre: '', descripcion: '', color: '#3B82F6', orden: 0 });
        cargarFases();
      }
    } catch (error) {
      console.error('Error al crear fase:', error);
    }
  };

  const handleActualizar = async (id: number) => {
    try {
      const res = await fetch(`/api/fases-casos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setEditando(null);
        setFormData({ nombre: '', descripcion: '', color: '#3B82F6', orden: 0 });
        cargarFases();
      }
    } catch (error) {
      console.error('Error al actualizar fase:', error);
    }
  };

  const handleEliminar = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar esta fase?')) return;

    try {
      const res = await fetch(`/api/fases-casos/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        cargarFases();
      }
    } catch (error) {
      console.error('Error al eliminar fase:', error);
    }
  };

  const iniciarEdicion = (fase: FaseCaso) => {
    setEditando(fase.id);
    setFormData({
      nombre: fase.nombre,
      descripcion: fase.descripcion || '',
      color: fase.color || '#3B82F6',
      orden: fase.orden,
    });
  };

  const cancelarEdicion = () => {
    setEditando(null);
    setNuevaFase(false);
    setFormData({ nombre: '', descripcion: '', color: '#3B82F6', orden: 0 });
  };

  const coloresPredefinidos = [
    '#3B82F6', // Azul
    '#10B981', // Verde
    '#F59E0B', // Amarillo
    '#EF4444', // Rojo
    '#8B5CF6', // Violeta
    '#EC4899', // Rosa
    '#06B6D4', // Cian
    '#6366F1', // Índigo
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fases de Casos</h1>
              <p className="mt-1 text-sm text-gray-500">Configura las etapas por las que pasan los trabajos dentales</p>
            </div>
          </div>
          <button
            onClick={() => setNuevaFase(true)}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Fase
          </button>
        </div>

        {/* Formulario nueva fase */}
        {nuevaFase && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Crear Nueva Fase</h3>
            <form onSubmit={handleCrear} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    required
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                    placeholder="Ej: Diseño, Laboratorio, Entrega"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex gap-2">
                    {coloresPredefinidos.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-900' : 'border-gray-200'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                    <input
                      type="color"
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      className="w-8 h-8 rounded cursor-pointer"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  rows={2}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                  placeholder="Descripción de esta fase"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  <Save className="w-4 h-4 inline mr-2" />
                  Guardar
                </button>
                <button
                  type="button"
                  onClick={cancelarEdicion}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300"
                >
                  <X className="w-4 h-4 inline mr-2" />
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de fases */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Cargando fases...</p>
          </div>
        ) : fases.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500">No hay fases configuradas. Crea la primera fase.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {fases
              .sort((a, b) => a.orden - b.orden)
              .map((fase) => (
                <div
                  key={fase.id}
                  className={`bg-white rounded-lg shadow p-4 border-l-4 ${
                    !fase.activo ? 'opacity-50' : ''
                  }`}
                  style={{ borderLeftColor: fase.color || '#3B82F6' }}
                >
                  {editando === fase.id ? (
                    <form onSubmit={(e) => { e.preventDefault(); handleActualizar(fase.id); }} className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={formData.nombre}
                          onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                          required
                          className="rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                        />
                        <div className="flex gap-2 items-center">
                          {coloresPredefinidos.map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setFormData({ ...formData, color })}
                              className={`w-6 h-6 rounded-full border-2 ${
                                formData.color === color ? 'border-gray-900' : 'border-gray-200'
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                          <input
                            type="color"
                            value={formData.color}
                            onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                            className="w-6 h-6 rounded cursor-pointer"
                          />
                        </div>
                      </div>
                      <textarea
                        value={formData.descripcion}
                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                        rows={2}
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex gap-2">
                        <button
                          type="submit"
                          className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700"
                        >
                          <Save className="w-4 h-4 inline mr-1" />
                          Guardar
                        </button>
                        <button
                          type="button"
                          onClick={cancelarEdicion}
                          className="bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-300"
                        >
                          <X className="w-4 h-4 inline mr-1" />
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-5 h-5 text-gray-400" />
                        <div>
                          <h3 className="font-semibold text-gray-900">{fase.nombre}</h3>
                          {fase.descripcion && (
                            <p className="text-sm text-gray-500">{fase.descripcion}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!fase.activo && (
                          <span className="text-xs text-gray-400">Inactiva</span>
                        )}
                        <button
                          onClick={() => iniciarEdicion(fase)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleEliminar(fase.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
}
