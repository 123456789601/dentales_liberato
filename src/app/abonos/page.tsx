'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, DollarSign, Calendar, CreditCard, Trash2 } from 'lucide-react';

interface Abono {
  id: number;
  monto: number;
  metodo: string;
  referencia?: string;
  notas?: string;
  fecha: string;
  caso: {
    id: number;
    codigo: string;
    descripcion: string;
    paciente: {
      nombre: string;
    };
  };
}

export default function AbonosPage() {
  const [abonos, setAbonos] = useState<Abono[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarAbonos();
  }, []);

  const cargarAbonos = async () => {
    try {
      const res = await fetch('/api/abonos');
      if (res.ok) {
        const data = await res.json();
        setAbonos(data);
      }
    } catch (error) {
      console.error('Error al cargar abonos:', error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarAbono = async (id: number) => {
    if (!confirm('¿Está seguro de eliminar este abono? Esta acción revertirá la cuenta.')) return;

    try {
      const res = await fetch(`/api/abonos/${id}`, { method: 'DELETE' });
      if (res.ok) {
        cargarAbonos();
      }
    } catch (error) {
      console.error('Error al eliminar abono:', error);
    }
  };

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(monto);
  };

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Abonos</h1>
            <p className="mt-1 text-sm text-gray-500">Historial de pagos y abonos</p>
          </div>
          <Link
            href="/abonos/nuevo"
            className="mt-4 sm:mt-0 inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Abono
          </Link>
        </div>

        {/* Tabla de abonos */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Cargando abonos...</p>
          </div>
        ) : abonos.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <DollarSign className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay abonos</h3>
            <p className="mt-1 text-sm text-gray-500">Comience registrando un nuevo abono.</p>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Caso
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Método
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Monto
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {abonos.map((abono) => (
                    <tr key={abono.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{formatearFecha(abono.fecha)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{abono.caso.codigo}</div>
                        <div className="text-sm text-gray-500">{abono.caso.descripcion}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{abono.caso.paciente.nombre}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <CreditCard className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-900">{abono.metodo}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="text-sm font-bold text-green-600">
                          {formatearMoneda(abono.monto)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => eliminarAbono(abono.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
