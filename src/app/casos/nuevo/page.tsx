'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Upload, X } from 'lucide-react';

interface Paciente {
  id: number;
  nombre: string;
}

interface Fase {
  id: number;
  nombre: string;
  color?: string;
}

export default function NuevoCasoPage() {
  const router = useRouter();
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [fases, setFases] = useState<Fase[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    pacienteId: '',
    descripcion: '',
    estado: 'pendiente',
    valorTotal: '',
    fechaEntrega: '',
    notas: '',
    faseId: '',
    clinica: '',
    imagen: null as File | null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const [pacientesRes, fasesRes] = await Promise.all([
        fetch('/api/pacientes'),
        fetch('/api/fases-casos'),
      ]);
      
      if (pacientesRes.ok) {
        const pacientesData = await pacientesRes.json();
        setPacientes(pacientesData.data || pacientesData);
      }
      
      if (fasesRes.ok) {
        const fasesData = await fasesRes.json();
        setFases(fasesData.data || fasesData);
      }
    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos necesarios');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, imagen: file });
      
      // Crear preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData({ ...formData, imagen: null });
    setPreviewUrl(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // Crear FormData para enviar el archivo
      const formDataToSend = new FormData();
      formDataToSend.append('pacienteId', formData.pacienteId);
      formDataToSend.append('descripcion', formData.descripcion);
      formDataToSend.append('estado', formData.estado);
      formDataToSend.append('valorTotal', formData.valorTotal);
      formDataToSend.append('fechaEntrega', formData.fechaEntrega);
      formDataToSend.append('notas', formData.notas);
      formDataToSend.append('faseId', formData.faseId);
      formDataToSend.append('clinica', formData.clinica);
      
      if (formData.imagen) {
        formDataToSend.append('imagen', formData.imagen);
      }

      const res = await fetch('/api/casos', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al crear el caso');
      }

      router.push('/casos');
    } catch (error: any) {
      console.error('Error al crear caso:', error);
      setError(error.message || 'Error al crear el caso');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Nuevo Caso</h1>
            <p className="mt-1 text-sm text-gray-500">Crear un nuevo trabajo dental</p>
          </div>
        </div>

        {/* Formulario */}
        <div className="bg-white rounded-lg shadow p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Paciente *
              </label>
              <select
                required
                value={formData.pacienteId}
                onChange={(e) => setFormData({ ...formData, pacienteId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Seleccione un paciente</option>
                {pacientes.map((paciente) => (
                  <option key={paciente.id} value={paciente.id}>
                    {paciente.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                required
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Descripción del trabajo dental"
              />
            </div>

            {/* Estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estado
              </label>
              <select
                value={formData.estado}
                onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completado">Completado</option>
                <option value="cancelado">Cancelado</option>
              </select>
            </div>

            {/* Valor Total */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Valor Total
              </label>
              <input
                type="number"
                value={formData.valorTotal}
                onChange={(e) => setFormData({ ...formData, valorTotal: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00"
                step="0.01"
                min="0"
              />
            </div>

            {/* Fecha de Entrega */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha de Entrega
              </label>
              <input
                type="date"
                value={formData.fechaEntrega}
                onChange={(e) => setFormData({ ...formData, fechaEntrega: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Fase */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fase
              </label>
              <select
                value={formData.faseId}
                onChange={(e) => setFormData({ ...formData, faseId: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Sin fase</option>
                {fases.map((fase) => (
                  <option key={fase.id} value={fase.id}>
                    {fase.nombre}
                  </option>
                ))}
              </select>
            </div>

            {/* Clínica */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Clínica de Origen
              </label>
              <input
                type="text"
                value={formData.clinica}
                onChange={(e) => setFormData({ ...formData, clinica: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre de la clínica"
              />
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Imagen
              </label>
              <div className="space-y-3">
                {previewUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                    <input
                      type="file"
                      id="imagen"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    <label
                      htmlFor="imagen"
                      className="cursor-pointer flex flex-col items-center gap-2"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Haz clic para subir una imagen
                      </span>
                      <span className="text-xs text-gray-400">
                        PNG, JPG, GIF hasta 5MB
                      </span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas
              </label>
              <textarea
                value={formData.notas}
                onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notas adicionales"
              />
            </div>

            {/* Botones */}
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Creando...' : 'Crear Caso'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
