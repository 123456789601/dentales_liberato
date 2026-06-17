/**
 * Dentales Liberato - Sistema de conversión de unidades de medida
 * Convierte entre diferentes unidades para inventario dental
 */

export enum UnidadMedida {
  gramo = 'gramo',
  kilogramo = 'kilogramo',
  mililitro = 'mililitro',
  litro = 'litro',
  unidad = 'unidad',
  caja = 'caja',
  frasco = 'frasco',
  bolsa = 'bolsa',
}

/**
 * Factores de conversión a la unidad base
 * Base: gramos para peso, mililitros para volumen, unidades para conteo
 */
const FACTORES_CONVERSION: Record<UnidadMedida, number> = {
  [UnidadMedida.gramo]: 1,
  [UnidadMedida.kilogramo]: 1000,
  [UnidadMedida.mililitro]: 1,
  [UnidadMedida.litro]: 1000,
  [UnidadMedida.unidad]: 1,
  [UnidadMedida.caja]: 1, // Depende de cantidadPorCaja del producto
  [UnidadMedida.frasco]: 1, // Depende de cantidadPorEmpaque del producto
  [UnidadMedida.bolsa]: 1, // Depende de cantidadPorEmpaque del producto
};

/**
 * Determina si una unidad es de peso
 */
export function esUnidadPeso(unidad: UnidadMedida): boolean {
  return unidad === UnidadMedida.gramo || unidad === UnidadMedida.kilogramo;
}

/**
 * Determina si una unidad es de volumen
 */
export function esUnidadVolumen(unidad: UnidadMedida): boolean {
  return unidad === UnidadMedida.mililitro || unidad === UnidadMedida.litro;
}

/**
 * Determina si una unidad es de conteo
 */
export function esUnidadConteo(unidad: UnidadMedida): boolean {
  return unidad === UnidadMedida.unidad || unidad === UnidadMedida.caja || 
         unidad === UnidadMedida.frasco || unidad === UnidadMedida.bolsa;
}

/**
 * Convierte una cantidad de una unidad a otra
 * @param cantidad Cantidad a convertir
 * @param desde Unidad de origen
 * @param hasta Unidad de destino
 * @param cantidadPorCaja Cantidad por caja (si aplica)
 * @param cantidadPorEmpaque Cantidad por empaque (si aplica)
 */
export function convertirUnidad(
  cantidad: number,
  desde: UnidadMedida,
  hasta: UnidadMedida,
  cantidadPorCaja?: number,
  cantidadPorEmpaque?: number
): number {
  // Si son la misma unidad, no hay conversión
  if (desde === hasta) {
    return cantidad;
  }

  // Validar compatibilidad de unidades
  if (!sonUnidadesCompatibles(desde, hasta)) {
    throw new Error(`No se puede convertir ${desde} a ${hasta}: unidades incompatibles`);
  }

  // Convertir a unidad base
  const cantidadBase = convertirAUnidadBase(cantidad, desde, cantidadPorCaja, cantidadPorEmpaque);
  
  // Convertir de unidad base a destino
  return convertirDeUnidadBase(cantidadBase, hasta, cantidadPorCaja, cantidadPorEmpaque);
}

/**
 * Verifica si dos unidades son compatibles para conversión
 */
function sonUnidadesCompatibles(unidad1: UnidadMedida, unidad2: UnidadMedida): boolean {
  const esPeso1 = esUnidadPeso(unidad1);
  const esPeso2 = esUnidadPeso(unidad2);
  const esVolumen1 = esUnidadVolumen(unidad1);
  const esVolumen2 = esUnidadVolumen(unidad2);
  const esConteo1 = esUnidadConteo(unidad1);
  const esConteo2 = esUnidadConteo(unidad2);

  return (esPeso1 && esPeso2) || (esVolumen1 && esVolumen2) || (esConteo1 && esConteo2);
}

/**
 * Convierte una cantidad a su unidad base
 */
export function convertirAUnidadBase(
  cantidad: number,
  desde: UnidadMedida,
  cantidadPorCaja?: number,
  cantidadPorEmpaque?: number
): number {
  switch (desde) {
    case UnidadMedida.kilogramo:
      return cantidad * 1000; // a gramos
    case UnidadMedida.litro:
      return cantidad * 1000; // a mililitros
    case UnidadMedida.caja:
      return cantidad * (cantidadPorCaja || 1); // a unidades base
    case UnidadMedida.frasco:
    case UnidadMedida.bolsa:
      return cantidad * (cantidadPorEmpaque || 1); // a unidades base
    default:
      return cantidad; // ya está en unidad base
  }
}

/**
 * Convierte una cantidad desde unidad base a la unidad deseada
 */
function convertirDeUnidadBase(
  cantidad: number,
  hasta: UnidadMedida,
  cantidadPorCaja?: number,
  cantidadPorEmpaque?: number
): number {
  switch (hasta) {
    case UnidadMedida.kilogramo:
      return cantidad / 1000; // de gramos a kg
    case UnidadMedida.litro:
      return cantidad / 1000; // de mililitros a L
    case UnidadMedida.caja:
      return cantidad / (cantidadPorCaja || 1); // de unidades base a cajas
    case UnidadMedida.frasco:
    case UnidadMedida.bolsa:
      return cantidad / (cantidadPorEmpaque || 1); // de unidades base a empaques
    default:
      return cantidad; // ya está en unidad base
  }
}

/**
 * Formatea una cantidad con su unidad de medida
 */
export function formatearCantidad(cantidad: number, unidad: UnidadMedida): string {
  const simbolo = obtenerSimboloUnidad(unidad);
  
  // Redondear según la unidad
  let cantidadFormateada: number;
  if (esUnidadPeso(unidad) || esUnidadVolumen(unidad)) {
    cantidadFormateada = Math.round(cantidad * 100) / 100;
  } else {
    cantidadFormateada = Math.round(cantidad);
  }

  return `${cantidadFormateada} ${simbolo}`;
}

/**
 * Obtiene el símbolo abreviado de una unidad
 */
export function obtenerSimboloUnidad(unidad: UnidadMedida): string {
  const simbolos: Record<UnidadMedida, string> = {
    [UnidadMedida.gramo]: 'g',
    [UnidadMedida.kilogramo]: 'kg',
    [UnidadMedida.mililitro]: 'ml',
    [UnidadMedida.litro]: 'L',
    [UnidadMedida.unidad]: 'un',
    [UnidadMedida.caja]: 'caja',
    [UnidadMedida.frasco]: 'frasco',
    [UnidadMedida.bolsa]: 'bolsa',
  };
  return simbolos[unidad];
}

/**
 * Calcula el costo por unidad base de un producto
 * @param precioCompra Precio de compra total
 * @param cantidadComprada Cantidad comprada en su unidad
 * @param unidad Unidad de la cantidad comprada
 * @param cantidadPorCaja Cantidad por caja (si aplica)
 * @param cantidadPorEmpaque Cantidad por empaque (si aplica)
 */
export function calcularCostoPorUnidadBase(
  precioCompra: number,
  cantidadComprada: number,
  unidad: UnidadMedida,
  cantidadPorCaja?: number,
  cantidadPorEmpaque?: number
): number {
  const cantidadBase = convertirAUnidadBase(cantidadComprada, unidad, cantidadPorCaja, cantidadPorEmpaque);
  if (cantidadBase === 0) return 0;
  return precioCompra / cantidadBase;
}

/**
 * Calcula el valor total del inventario de un producto
 * @param stockActual Stock actual en su unidad
 * @param unidad Unidad del stock
 * @param costoPorUnidadBase Costo por unidad base
 * @param cantidadPorCaja Cantidad por caja (si aplica)
 * @param cantidadPorEmpaque Cantidad por empaque (si aplica)
 */
export function calcularValorInventario(
  stockActual: number,
  unidad: UnidadMedida,
  costoPorUnidadBase: number,
  cantidadPorCaja?: number,
  cantidadPorEmpaque?: number
): number {
  const cantidadBase = convertirAUnidadBase(stockActual, unidad, cantidadPorCaja, cantidadPorEmpaque);
  return cantidadBase * costoPorUnidadBase;
}

/**
 * Ejemplo de uso para resina:
 * 10 cajas compradas a $450.000
 * Cada caja contiene 100g
 * Costo por gramo = $450.000 / (10 * 100) = $450/g
 * Si se usan 25g: 25 * $450 = $11.250
 */
export function ejemploCalculoResina() {
  const precioCompra = 450000;
  const cajasCompradas = 10;
  const gramosPorCaja = 100;
  
  const costoPorGramo = calcularCostoPorUnidadBase(
    precioCompra,
    cajasCompradas,
    UnidadMedida.caja,
    gramosPorCaja
  );
  
  const gramosUsados = 25;
  const costoUso = gramosUsados * costoPorGramo;
  
  const stockRestanteCajas = (cajasCompradas * gramosPorCaja - gramosUsados) / gramosPorCaja;
  
  return {
    costoPorGramo,
    costoUso,
    stockRestanteCajas,
    stockRestanteGramos: cajasCompradas * gramosPorCaja - gramosUsados,
  };
}
