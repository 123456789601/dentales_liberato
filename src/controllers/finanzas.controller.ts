/**
 * Dentales Liberato - Controlador de Finanzas
 * Gestión de transacciones y métricas financieras
 */
import { prisma } from '../lib/prisma';

export async function obtenerTransacciones(fechaInicio?: Date, fechaFin?: Date) {
  const where: any = {};
  if (fechaInicio || fechaFin) {
    where.fecha = {};
    if (fechaInicio) where.fecha.gte = fechaInicio;
    if (fechaFin) where.fecha.lte = fechaFin;
  }

  return await prisma.transaccion.findMany({
    where,
    include: {
      usuario: true,
    },
    orderBy: { fecha: 'desc' },
  });
}

export async function obtenerResumenFinanciero(fechaInicio?: Date, fechaFin?: Date) {
  const where: any = {};
  if (fechaInicio || fechaFin) {
    where.fecha = {};
    if (fechaInicio) where.fecha.gte = fechaInicio;
    if (fechaFin) where.fecha.lte = fechaFin;
  }

  const transacciones = await prisma.transaccion.findMany({
    where,
  });

  const ingresos = transacciones
    .filter(t => t.tipo === 'ingreso' || t.tipo === 'abono')
    .reduce((sum, t) => sum + Number(t.monto), 0);

  const gastos = transacciones
    .filter(t => t.tipo === 'gasto')
    .reduce((sum, t) => sum + Number(t.monto), 0);

  const saldo = ingresos - gastos;

  // Obtener cuentas por cobrar
  const cuentasPorCobrar = await prisma.cuenta.findMany({
    where: {
      tipo: 'por_cobrar',
      estado: 'pendiente',
    },
  });

  const totalPorCobrar = cuentasPorCobrar.reduce(
    (sum, c) => sum + Number(c.saldoPendiente),
    0
  );

  // Obtener valor del inventario
  const productos = await prisma.producto.findMany({
    where: { activo: true },
  });

  const valorInventario = productos.reduce((sum, p) => {
    const stock = Number(p.stockActual);
    const costo = Number(p.costoPorUnidad);
    return sum + (stock * costo);
  }, 0);

  return {
    ingresos,
    gastos,
    saldo,
    totalPorCobrar,
    valorInventario,
    cantidadTransacciones: transacciones.length,
  };
}

export async function crearTransaccion(data: {
  tipo: 'ingreso' | 'gasto' | 'abono' | 'reembolso';
  monto: number;
  descripcion: string;
  referencia?: string;
  categoria?: string;
  usuarioId?: number;
}) {
  // Crear transacción
  const transaccion = await prisma.transaccion.create({
    data,
  });

  // Actualizar caja
  await actualizarCaja(transaccion);

  return transaccion;
}

async function actualizarCaja(transaccion: any) {
  // Obtener saldo actual de caja
  const ultimoMovimiento = await prisma.caja.findFirst({
    orderBy: { fecha: 'desc' },
  });

  const saldoAnterior = ultimoMovimiento 
    ? Number(ultimoMovimiento.saldoPosterior) 
    : 0;

  // Determinar tipo de movimiento de caja
  let tipoCaja: string;
  let montoCaja: number;

  if (transaccion.tipo === 'ingreso' || transaccion.tipo === 'abono') {
    tipoCaja = 'ingreso';
    montoCaja = Number(transaccion.monto);
  } else {
    tipoCaja = 'egreso';
    montoCaja = -Number(transaccion.monto);
  }

  const saldoPosterior = saldoAnterior + montoCaja;

  // Crear movimiento de caja
  await prisma.caja.create({
    data: {
      tipo: tipoCaja,
      monto: Math.abs(montoCaja),
      saldoAnterior,
      saldoPosterior,
      descripcion: transaccion.descripcion,
      referencia: transaccion.referencia,
      transaccionId: transaccion.id,
    },
  });
}

export async function obtenerMovimientosCaja(fechaInicio?: Date, fechaFin?: Date) {
  const where: any = {};
  if (fechaInicio || fechaFin) {
    where.fecha = {};
    if (fechaInicio) where.fecha.gte = fechaInicio;
    if (fechaFin) where.fecha.lte = fechaFin;
  }

  return await prisma.caja.findMany({
    where,
    orderBy: { fecha: 'desc' },
  });
}

export async function obtenerSaldoCaja() {
  const ultimoMovimiento = await prisma.caja.findFirst({
    orderBy: { fecha: 'desc' },
  });

  return ultimoMovimiento 
    ? Number(ultimoMovimiento.saldoPosterior) 
    : 0;
}
