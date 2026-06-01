/**
 * Dentales Liberato - Controlador de Casos
 * Gestión de casos/trabajos dentales
 */
import { prisma } from '../lib/prisma';
import { calcularCostoPorUnidadBase, convertirAUnidadBase, UnidadMedida } from '../lib/unidades';

export async function obtenerCasos() {
  return await prisma.caso.findMany({
    include: {
      paciente: true,
      materiales: {
        include: {
          producto: true,
        },
      },
      abonos: true,
      cuenta: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function obtenerCasoPorId(id: number) {
  return await prisma.caso.findUnique({
    where: { id },
    include: {
      paciente: true,
      materiales: {
        include: {
          producto: true,
        },
      },
      abonos: {
        orderBy: { fecha: 'desc' },
      },
      cuenta: true,
      movimientos: {
        include: {
          producto: true,
          usuario: true,
        },
      },
    },
  });
}

export async function crearCaso(data: {
  codigo: string;
  pacienteId: number;
  descripcion: string;
  valorTotal: number;
  fechaEntrega?: Date;
  notas?: string;
}) {
  // Crear el caso
  const caso = await prisma.caso.create({
    data: {
      ...data,
      estado: 'pendiente',
    },
  });

  // Crear cuenta por cobrar asociada
  await prisma.cuenta.create({
    data: {
      casoId: caso.id,
      tipo: 'por_cobrar',
      valorTotal: data.valorTotal,
      valorPagado: 0,
      saldoPendiente: data.valorTotal,
      fechaVencimiento: data.fechaEntrega,
      estado: 'pendiente',
    },
  });

  return caso;
}

export async function actualizarCaso(id: number, data: {
  descripcion?: string;
  estado?: 'pendiente' | 'en_progreso' | 'completado' | 'cancelado';
  valorTotal?: number;
  fechaEntrega?: Date;
  fechaCompletado?: Date;
  notas?: string;
}) {
  return await prisma.caso.update({
    where: { id },
    data,
  });
}

export async function agregarMaterialACaso(casoId: number, productoId: number, cantidad: number) {
  // Obtener el producto
  const producto = await prisma.producto.findUnique({
    where: { id: productoId },
  });

  if (!producto) {
    throw new Error('Producto no encontrado');
  }

  // Calcular costo unitario
  const costoPorUnidadBase = producto.costoPorUnidad;
  const cantidadBase = convertirAUnidadBase(
    cantidad,
    producto.unidadMedida as UnidadMedida,
    producto.cantidadPorCaja ? Number(producto.cantidadPorCaja) : undefined,
    producto.cantidadPorEmpaque ? Number(producto.cantidadPorEmpaque) : undefined
  );
  const costoTotal = cantidadBase * Number(costoPorUnidadBase);

  // Crear o actualizar el material del caso
  const casoMaterial = await prisma.casoMaterial.upsert({
    where: {
      casoId_productoId: {
        casoId,
        productoId,
      },
    },
    update: {
      cantidad: cantidad,
      costoUnitario: costoPorUnidadBase,
      costoTotal,
    },
    create: {
      casoId,
      productoId,
      cantidad,
      costoUnitario: costoPorUnidadBase,
      costoTotal,
    },
  });

  // Actualizar el costo total de materiales del caso
  await actualizarCostosCaso(casoId);

  return casoMaterial;
}

export async function eliminarMaterialDeCaso(casoId: number, productoId: number) {
  await prisma.casoMaterial.delete({
    where: {
      casoId_productoId: {
        casoId,
        productoId,
      },
    },
  });

  // Actualizar el costo total de materiales del caso
  await actualizarCostosCaso(casoId);
}

async function actualizarCostosCaso(casoId: number) {
  // Obtener todos los materiales del caso
  const materiales = await prisma.casoMaterial.findMany({
    where: { casoId },
  });

  // Calcular costo total de materiales
  const costoMateriales = materiales.reduce(
    (sum, m) => sum + Number(m.costoTotal),
    0
  );

  // Obtener el caso
  const caso = await prisma.caso.findUnique({
    where: { id: casoId },
  });

  if (!caso) return;

  // Calcular ganancia proyectada
  const gananciaProyectada = Number(caso.valorTotal) - costoMateriales;

  // Actualizar el caso
  await prisma.caso.update({
    where: { id: casoId },
    data: {
      costoMateriales,
      gananciaProyectada,
    },
  });
}

export async function completarCaso(id: number) {
  const caso = await prisma.caso.update({
    where: { id },
    data: {
      estado: 'completado',
      fechaCompletado: new Date(),
    },
  });

  // Actualizar cuenta si está completamente pagada
  if (caso.cuenta) {
    const cuenta = await prisma.cuenta.findUnique({
      where: { id: caso.cuenta.id },
    });

    if (cuenta && Number(cuenta.saldoPendiente) <= 0) {
      await prisma.cuenta.update({
        where: { id: cuenta.id },
        data: { estado: 'pagada' },
      });
    }
  }

  return caso;
}

export async function buscarCasos(query: string) {
  return await prisma.caso.findMany({
    where: {
      OR: [
        { codigo: { contains: query } },
        { descripcion: { contains: query } },
        { paciente: { nombre: { contains: query } } },
      ],
    },
    include: {
      paciente: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}
