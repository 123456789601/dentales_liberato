'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Plus, Minus, RefreshCw, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface ResumenFinanciero {
  ingresos: number;
  gastos: number;
  saldo: number;
  totalPorCobrar: number;
  valorInventario: number;
  cantidadTransacciones: number;
}

interface Transaccion {
  id: number;
  tipo: 'ingreso' | 'gasto' | 'abono' | 'reembolso';
  monto: number;
  descripcion: string;
  categoria?: string;
  fecha: string;
}

export default function FinanzasPage() {
  const router = useRouter();
  const [resumen, setResumen] = useState<ResumenFinanciero | null>(null);
  const [transacciones, setTransacciones] = useState<Transaccion[]>([]);
  const [loading, setLoading] = useState(true);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [tipoTransaccion, setTipoTransaccion] = useState<'ingreso' | 'gasto'>('ingreso');
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [categoria, setCategoria] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarResumen();
    cargarTransacciones();
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

  const cargarTransacciones = async () => {
    try {
      const res = await fetch('/api/finanzas?accion=transacciones');
      if (res.ok) {
        const data = await res.json();
        setTransacciones(data);
      }
    } catch (error) {
      console.error('Error al cargar transacciones:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setEnviando(true);

    try {
      const res = await fetch('/api/finanzas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: tipoTransaccion,
          monto: parseFloat(monto),
          descripcion,
          categoria,
        }),
      });

      if (res.ok) {
        setMonto('');
        setDescripcion('');
        setCategoria('');
        setMostrarFormulario(false);
        cargarResumen();
        cargarTransacciones();
      }
    } catch (error) {
      console.error('Error al registrar transacción:', error);
    } finally {
      setEnviando(false);
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
        <div className="mb-8 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-6 h-6 text-gray-600" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Finanzas</h1>
              <p className="mt-1 text-sm text-gray-500">Resumen financiero del laboratorio dental</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setTipoTransaccion('ingreso'); setMostrarFormulario(true); }}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Registrar Ingreso
            </button>
            <button
              onClick={() => { setTipoTransaccion('gasto'); setMostrarFormulario(true); }}
              className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              <Minus className="w-4 h-4" />
              Registrar Gasto
            </button>
            <button
              onClick={() => { cargarResumen(); cargarTransacciones(); }}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Formulario de transacción */}
        {mostrarFormulario && (
          <div className="mb-6 bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">
              {tipoTransaccion === 'ingreso' ? 'Registrar Ingreso' : 'Registrar Gasto'}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Monto</label>
                <input
                  type="number"
                  value={monto}
                  onChange={(e) => setMonto(e.target.value)}
                  required
                  min="0"
                  step="0.01"
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                <input
                  type="text"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Descripción de la transacción"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría (opcional)</label>
                <input
                  type="text"
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ej: Servicios, Materiales"
                />
              </div>
              <div className="flex items-end gap-2">
                <button
                  type="submit"
                  disabled={enviando}
                  className={`flex-1 rounded-lg px-4 py-2 text-white font-medium transition-colors ${
                    tipoTransaccion === 'ingreso'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:opacity-50`}
                >
                  {enviando ? 'Guardando...' : 'Guardar'}
                </button>
                <button
                  type="button"
                  onClick={() => setMostrarFormulario(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

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

            {/* Tabla de transacciones */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Transacciones Recientes</h3>
              {transacciones.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No hay transacciones registradas</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Fecha</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Tipo</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Descripción</th>
                        <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Categoría</th>
                        <th className="text-right py-3 px-4 text-sm font-medium text-gray-500">Monto</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transacciones.map((transaccion) => (
                        <tr key={transaccion.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">
                            {new Date(transaccion.fecha).toLocaleDateString('es-CO')}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              transaccion.tipo === 'ingreso' || transaccion.tipo === 'abono'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {transaccion.tipo.toUpperCase()}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-900">{transaccion.descripcion}</td>
                          <td className="py-3 px-4 text-sm text-gray-500">{transaccion.categoria || '-'}</td>
                          <td className={`py-3 px-4 text-sm font-medium text-right ${
                            transaccion.tipo === 'ingreso' || transaccion.tipo === 'abono'
                              ? 'text-green-600'
                              : 'text-red-600'
                          }`}>
                            {transaccion.tipo === 'ingreso' || transaccion.tipo === 'abono' ? '+' : '-'}
                            {formatearMoneda(transaccion.monto)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
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
