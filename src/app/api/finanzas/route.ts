/**
 * Dentales Liberato - API de Finanzas
 * Endpoints para gestión financiera
 */
import { NextRequest, NextResponse } from 'next/server';
import * as finanzasController from '@/controllers/finanzas.controller';
import { obtenerSesionActual } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const accion = searchParams.get('accion');

    if (accion === 'resumen') {
      const fechaInicio = searchParams.get('fechaInicio') 
        ? new Date(searchParams.get('fechaInicio')!) 
        : undefined;
      const fechaFin = searchParams.get('fechaFin') 
        ? new Date(searchParams.get('fechaFin')!) 
        : undefined;
      
      const resumen = await finanzasController.obtenerResumenFinanciero(fechaInicio, fechaFin);
      return NextResponse.json(resumen);
    }

    if (accion === 'saldo_caja') {
      const saldo = await finanzasController.obtenerSaldoCaja();
      return NextResponse.json({ saldo });
    }

    if (accion === 'movimientos_caja') {
      const fechaInicio = searchParams.get('fechaInicio') 
        ? new Date(searchParams.get('fechaInicio')!) 
        : undefined;
      const fechaFin = searchParams.get('fechaFin') 
        ? new Date(searchParams.get('fechaFin')!) 
        : undefined;
      
      const movimientos = await finanzasController.obtenerMovimientosCaja(fechaInicio, fechaFin);
      return NextResponse.json(movimientos);
    }

    // Por defecto, obtener transacciones
    const fechaInicio = searchParams.get('fechaInicio') 
      ? new Date(searchParams.get('fechaInicio')!) 
      : undefined;
    const fechaFin = searchParams.get('fechaFin') 
      ? new Date(searchParams.get('fechaFin')!) 
      : undefined;
    
    const transacciones = await finanzasController.obtenerTransacciones(fechaInicio, fechaFin);
    return NextResponse.json(transacciones);
  } catch (error) {
    console.error('Error al obtener datos financieros:', error);
    return NextResponse.json({ error: 'Error al obtener datos financieros' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const transaccion = await finanzasController.crearTransaccion(data);
    return NextResponse.json(transaccion, { status: 201 });
  } catch (error) {
    console.error('Error al crear transacción:', error);
    return NextResponse.json({ error: 'Error al crear transacción' }, { status: 500 });
  }
}
