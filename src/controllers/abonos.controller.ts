/**
 * Dentales Liberato - Controlador de Abonos
 * Gestión de abonos a cuentas por cobrar
 */
import { prisma } from '../lib/prisma';

export async function obtenerAbonos(casoId?: number) {
  const where = casoId ? { casoId } : {};
  
  return await prisma.abono.findMany({
    where,
    include: {
      cuenta: true,
      caso: {
        include: {
          paciente: true,
        },
      },
    },
    orderBy: { fecha: 'desc' },
  });
}

export async function obtenerAbonoPorId(id: number) {
  return await prisma.abono.findUnique({
    where: { id },
    include: {
      cuenta: true,
      caso: {
        include: {
          paciente: true,
        },
      },
    },
  });
}

export async function crearAbono(data: {
  cuentaId: number;
  casoId: number;
  monto: number;
  metodo: string;
  referencia?: string;
  notas?: string;
}) {
  // Crear el abono
  const abono = await prisma.abono.create({
    data,
  });

  // Actualizar la cuenta
  const cuenta = await prisma.cuenta.findUnique({
    where: { id: data.cuentaId },
  });

  if (!cuenta) {
    throw new Error('Cuenta no encontrada');
  }

  const nuevoValorPagado = Number(cuenta.valorPagado) + data.monto;
  const nuevoSaldoPendiente = Number(cuenta.valorTotal) - nuevoValorPagado;

  await prisma.cuenta.update({
    where: { id: data.cuentaId },
    data: {
      valorPagado: nuevoValorPagado,
      saldoPendiente: nuevoSaldoPendiente,
      estado: nuevoSaldoPendiente <= 0 ? 'pagada' : 'pendiente',
    },
  });

  // Crear transacción financiera
  await prisma.transaccion.create({
    data: {
      tipo: 'abono',
      monto: data.monto,
      descripcion: `Abono a caso ${data.casoId}`,
      referencia: data.referencia,
      categoria: 'abonos',
    },
  });

  // Actualizar caja
  await actualizarCajaPorAbono(abono);

  return abono;
}

async function actualizarCajaPorAbono(abono: any) {
  // Obtener saldo actual de caja
  const ultimoMovimiento = await prisma.caja.findFirst({
    orderBy: { fecha: 'desc' },
  });

  const saldoAnterior = ultimoMovimiento 
    ? Number(ultimoMovimiento.saldoPosterior) 
    : 0;

  const monto = Number(abono.monto);
  const saldoPosterior = saldoAnterior + monto;

  // Crear movimiento de caja
  await prisma.caja.create({
    data: {
      tipo: 'ingreso',
      monto,
      saldoAnterior,
      saldoPosterior,
      descripcion: `Abono recibido - ${abono.metodo}`,
      referencia: abono.referencia,
      abonoId: abono.id,
    },
  });
}

export async function eliminarAbono(id: number) {
  const abono = await prisma.abono.findUnique({
    where: { id },
    include: { cuenta: true },
  });

  if (!abono) {
    throw new Error('Abono no encontrado');
  }

  // Revertir la cuenta
  const cuenta = abono.cuenta;
  const nuevoValorPagado = Number(cuenta.valorPagado) - Number(abono.monto);
  const nuevoSaldoPendiente = Number(cuenta.valorTotal) - nuevoValorPagado;

  await prisma.cuenta.update({
    where: { id: cuenta.id },
    data: {
      valorPagado: nuevoValorPagado,
      saldoPendiente: nuevoSaldoPendiente,
      estado: 'pendiente',
    },
  });

  // Eliminar el abono
  await prisma.abono.delete({
    where: { id },
  });
}

export async function obtenerAbonosPorCuenta(cuentaId: number) {
  return await prisma.abono.findMany({
    where: { cuentaId },
    orderBy: { fecha: 'desc' },
  });
}
