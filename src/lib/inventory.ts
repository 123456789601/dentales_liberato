/**
 * Dentales Liberato - Lógica de negocio de inventario
 * Cálculos financieros, semáforo de alertas y métricas del dashboard
 */
import { Producto, Categoria } from '@prisma/client';
import { prisma } from './prisma';

/** Estados del semáforo de alertas clínicas */
export type SemaforoEstado = 'rojo' | 'amarillo' | 'verde';

export type ProductoConCategoria = Producto & { categoria: Categoria };

export interface ProductoConAlerta extends Omit<ProductoConCategoria, 'precioUnitario'> {
  precioUnitario: number;
  semaforo: SemaforoEstado;
  diasParaVencer: number | null;
  valorEnBodega: number;
}

export interface DashboardMetrics {
  totalInsumos: number;
  alertasStock: number;
  productosPorVencer: number;
  valorTotalInventario: number;
}

const MS_POR_DIA = 24 * 60 * 60 * 1000;
const DIAS_ALERTA_AMARILLO = 30;

/**
 * Calcula el estado del semáforo según reglas de negocio Dentales Liberato:
 * - Rojo: stock <= mínimo O producto vencido
 * - Amarillo: vence en menos de 30 días
 * - Verde: stock óptimo y sin riesgo de vencimiento próximo
 */
export function calcularSemaforo(
  stockActual: number,
  stockMinimo: number,
  fechaVencimiento: Date | null,
  referencia: Date = new Date()
): { semaforo: SemaforoEstado; diasParaVencer: number | null } {
  let diasParaVencer: number | null = null;

  if (fechaVencimiento) {
    const finDia = new Date(fechaVencimiento);
    finDia.setHours(23, 59, 59, 999);
    diasParaVencer = Math.ceil((finDia.getTime() - referencia.getTime()) / MS_POR_DIA);

    // Rojo: producto vencido
    if (diasParaVencer < 0) {
      return { semaforo: 'rojo', diasParaVencer };
    }
  }

  // Rojo: stock crítico
  if (stockActual <= stockMinimo) {
    return { semaforo: 'rojo', diasParaVencer };
  }

  // Amarillo: vencimiento próximo (< 30 días)
  if (diasParaVencer !== null && diasParaVencer <= DIAS_ALERTA_AMARILLO) {
    return { semaforo: 'amarillo', diasParaVencer };
  }

  return { semaforo: 'verde', diasParaVencer };
}

/** Valor en bodega de un producto: stock_actual * precio_unitario */
export function calcularValorProducto(stockActual: number, precioUnitario: number | { toString(): string }): number {
  const precio = typeof precioUnitario === 'number' ? precioUnitario : parseFloat(precioUnitario.toString());
  return stockActual * precio;
}

/**
 * Valor Total del Inventario en tiempo real
 * Fórmula: SUM(stock_actual * precio_unitario) para productos activos
 */
export async function calcularValorTotalInventario(): Promise<number> {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    select: { stockActual: true, precioUnitario: true },
  });

  return productos.reduce(
    (total, p) => total + calcularValorProducto(Number(p.stockActual), Number(p.precioUnitario)),
    0
  );
}

/** Enriquece productos con semáforo y valor en bodega */
export function enriquecerProductos(productos: ProductoConCategoria[]): ProductoConAlerta[] {
  return productos.map((p) => {
    const { semaforo, diasParaVencer } = calcularSemaforo(
      Number(p.stockActual),
      Number(p.stockMinimo),
      p.fechaVencimiento
    );
    return {
      ...p,
      semaforo,
      diasParaVencer,
      valorEnBodega: calcularValorProducto(Number(p.stockActual), Number(p.precioUnitario)),
      precioUnitario: Number(p.precioUnitario),
    };
  });
}

/**
 * Métricas del dashboard principal - Dentales Liberato
 * valorTotalInventario solo debe exponerse a rol admin (control en API)
 */
export async function obtenerMetricasDashboard(): Promise<DashboardMetrics> {
  const productos = await prisma.producto.findMany({
    where: { activo: true },
    include: { categoria: true },
  });

  const enriquecidos = enriquecerProductos(productos);

  const alertasStock = enriquecidos.filter((p) => p.semaforo === 'rojo' && p.stockActual <= p.stockMinimo).length;
  const productosPorVencer = enriquecidos.filter(
    (p) => p.diasParaVencer !== null && p.diasParaVencer >= 0 && p.diasParaVencer <= DIAS_ALERTA_AMARILLO
  ).length;

  const valorTotalInventario = enriquecidos.reduce((t, p) => t + p.valorEnBodega, 0);

  return {
    totalInsumos: productos.length,
    alertasStock: enriquecidos.filter((p) => p.semaforo === 'rojo').length,
    productosPorVencer,
    valorTotalInventario,
  };
}
