'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface ResumenFinanciero {
  ingresos: number;
  gastos: number;
  saldo: number;
  totalPorCobrar: number;
  valorInventario: number;
  cantidadTransacciones: number;
}

export default function FinanzasPage() {
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarResumen();
  }, []);

  const cargarResumen = async () => {
    try {
      const res = await fetch('/api/finanzas?accion=resumen');
      if (res.ok) {
        const data = await res.json();
        setResumen(data);
      }
    } catch (error) {
      console.error('Error al cargar resumen financiero:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatearMoneda = (monto: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(monto);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finanzas</h1>
          <p className="mt-1 text-sm text-gray-500">Resumen financiero del laboratorio dental</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-500">Cargando datos financieros...</p>
          </div>
        ) : resumen ? (
          <div className="space-y-6">
            {/* Tarjetas de métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Ingresos */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Ingresos</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">
                      {formatearMoneda(resumen.ingresos)}
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 rounded-full">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>

              {/* Gastos */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Gastos</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">
                      {formatearMoneda(resumen.gastos)}
                    </p>
                  </div>
                  <div className="p-3 bg-red-100 rounded-full">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              {/* Saldo */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Saldo Neto</p>
                    <p className={`text-2xl font-bold mt-1 ${resumen.saldo >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                      {formatearMoneda(resumen.saldo)}
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 rounded-full">
                    <Wallet className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              {/* Por Cobrar */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Por Cobrar</p>
                    <p className="text-2xl font-bold text-yellow-600 mt-1">
                      {formatearMoneda(resumen.totalPorCobrar)}
                    </p>
                  </div>
                  <div className="p-3 bg-yellow-100 rounded-full">
                    <DollarSign className="w-6 h-6 text-yellow-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Métricas adicionales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Valor del Inventario */}
              <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow p-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-100">Valor del Inventario</p>
                    <p className="text-3xl font-bold mt-1">
                      {formatearMoneda(resumen.valorInventario)}
                    </p>
                  </div>
                  <div className="p-3 bg-white/20 rounded-full">
                    <Wallet className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Transacciones */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Transacciones</p>
                    <p className="text-3xl font-bold text-gray-900 mt-1">
                      {resumen.cantidadTransacciones}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-100 rounded-full">
                    <ArrowUpRight className="w-8 h-8 text-gray-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Financiera</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Margen de Ganancia</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {resumen.ingresos > 0 
                      ? `${((resumen.saldo / resumen.ingresos) * 100).toFixed(1)}%` 
                      : '0%'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Ratio Gastos/Ingresos</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {resumen.ingresos > 0 
                      ? `${((resumen.gastos / resumen.ingresos) * 100).toFixed(1)}%` 
                      : '0%'}
                  </p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Transacciones Promedio</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {resumen.cantidadTransacciones > 0 
                      ? formatearMoneda((resumen.ingresos + resumen.gastos) / resumen.cantidadTransacciones)
                      : '$0'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Wallet className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay datos financieros</h3>
            <p className="mt-1 text-sm text-gray-500">Comience registrando transacciones.</p>
          </div>
        )}
      </div>
    </div>
  );
}
