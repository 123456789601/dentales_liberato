/**
 * Dentales Liberato - Integración Inventario con Finanzas
 * Actualización automática de costos cuando se consumen materiales
 */
import { prisma } from './prisma';
import { convertirAUnidadBase, UnidadMedida } from './unidades';
import { TipoMovimiento } from '@prisma/client';

/**
 * Registra el consumo de materiales de un caso y actualiza:
 * - Stock del producto
 * - Costos del caso
 * - Transacción financiera de gasto
 * - Movimiento de caja
 */
export async function registrarConsumoMateriales(
  casoId: number,
  materiales: { productoId: number; cantidad: number }[],
  usuarioId?: number
) {
  let costoTotalMateriales = 0;

  for (const material of materiales) {
    // Obtener el producto
    const producto = await prisma.producto.findUnique({
      where: { id: material.productoId },
    });

    if (!producto) {
      throw new Error(`Producto con ID ${material.productoId} no encontrado`);
    }

    // Calcular costo del consumo
    const cantidadBase = convertirAUnidadBase(
      material.cantidad,
      producto.unidadMedida as UnidadMedida,
      producto.cantidadPorCaja ? Number(producto.cantidadPorCaja) : undefined,
      producto.cantidadPorEmpaque ? Number(producto.cantidadPorEmpaque) : undefined
    );
    
    const costoConsumo = cantidadBase * Number(producto.costoPorUnidad);
    costoTotalMateriales += costoConsumo;

    // Actualizar stock del producto
    const nuevoStock = Number(producto.stockActual) - material.cantidad;
    
    if (nuevoStock < 0) {
      throw new Error(`Stock insuficiente para ${producto.nombre}`);
    }

    await prisma.producto.update({
      where: { id: material.productoId },
      data: { stockActual: nuevoStock },
    });

    // Registrar movimiento de inventario
    await prisma.movimiento.create({
      data: {
        tipo: TipoMovimiento.Salida,
        cantidad: material.cantidad,
        stockAnterior: Number(producto.stockActual),
        stockPosterior: nuevoStock,
        motivo: `Consumo caso ${casoId}`,
        productoId: material.productoId,
        usuarioId: usuarioId || 0,
      },
    });

    // Agregar o actualizar material en el caso
    await prisma.casoMaterial.upsert({
      where: {
        casoId_productoId: {
          casoId,
          productoId: material.productoId,
        },
      },
      update: {
        cantidad: material.cantidad,
        costoUnitario: producto.costoPorUnidad,
        costoTotal: costoConsumo,
      },
      create: {
        casoId,
        productoId: material.productoId,
        cantidad: material.cantidad,
        costoUnitario: producto.costoPorUnidad,
        costoTotal: costoConsumo,
      },
    });
  }

  // Actualizar costos del caso
  const caso = await prisma.caso.findUnique({
    where: { id: casoId },
  });

  if (!caso) {
    throw new Error(`Caso con ID ${casoId} no encontrado`);
  }

  const nuevoCostoMateriales = Number(caso.costoMateriales) + costoTotalMateriales;
  const nuevaGananciaProyectada = Number(caso.valorTotal) - nuevoCostoMateriales;

  await prisma.caso.update({
    where: { id: casoId },
    data: {
      costoMateriales: nuevoCostoMateriales,
      gananciaProyectada: nuevaGananciaProyectada,
    },
  });

  // Registrar transacción financiera de gasto
  await prisma.transaccion.create({
    data: {
      tipo: 'gasto',
      monto: costoTotalMateriales,
      descripcion: `Consumo de materiales para caso ${casoId}`,
      referencia: `CAS-${casoId}`,
      categoria: 'produccion',
      usuarioId: usuarioId || 0,
    },
  });

  return {
    costoTotalMateriales,
    nuevoCostoMateriales,
    nuevaGananciaProyectada,
  };
}

/**
 * Calcula el costo de producción de un caso basado en los materiales usados
 */
export async function calcularCostoProduccion(casoId: number) {
  const casoMateriales = await prisma.casoMaterial.findMany({
    where: { casoId },
    include: {
      producto: true,
    },
  });

  const costoTotal = casoMateriales.reduce(
    (sum, cm) => sum + Number(cm.costoTotal),
    0
  );

  return costoTotal;
}

/**
 * Obtiene el valor total del inventario actual
 */
export async function obtenerValorInventario() {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
  });

  const valorTotal = productos.reduce((sum, producto) => {
    const stock = Number(producto.stockActual);
    const costo = Number(producto.costoPorUnidad);
    return sum + (stock * costo);
  }, 0);

  return valorTotal;
}

/**
 * Actualiza el costo por unidad de un producto basado en una compra
 */
export async function actualizarCostoPorCompra(
  productoId: number,
  cantidadComprada: number,
  precioCompra: number,
  unidadMedida: UnidadMedida,
  cantidadPorCaja?: number,
  cantidadPorEmpaque?: number
) {
  const producto = await prisma.producto.findUnique({
    where: { id: productoId },
  });

  if (!producto) {
    throw new Error(`Producto con ID ${productoId} no encontrado`);
  }

  // Calcular nuevo costo por unidad base
  const cantidadBase = convertirAUnidadBase(
    cantidadComprada,
    unidadMedida,
    cantidadPorCaja,
    cantidadPorEmpaque
  );

  const nuevoCostoPorUnidad = precioCompra / cantidadBase;

  // Actualizar producto
  await prisma.producto.update({
    where: { id: productoId },
    data: {
      precioCompra,
      costoPorUnidad: nuevoCostoPorUnidad,
      stockActual: Number(producto.stockActual) + cantidadComprada,
    },
  });

  // Registrar transacción de compra
  await prisma.transaccion.create({
    data: {
      tipo: 'gasto',
      monto: precioCompra,
      descripcion: `Compra de ${producto.nombre}`,
      referencia: `PROD-${productoId}`,
      categoria: 'compras',
    },
  });

  return nuevoCostoPorUnidad;
}
