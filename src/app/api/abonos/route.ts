/**
 * Dentales Liberato - API de Abonos
 * Endpoints para gestión de abonos
 */
import { NextRequest, NextResponse } from 'next/server';
import * as abonosController from '@/controllers/abonos.controller';
import { obtenerSesionActual } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const casoId = searchParams.get('casoId');

    if (casoId) {
      const abonos = await abonosController.obtenerAbonosPorCuenta(Number(casoId));
      return NextResponse.json(abonos);
    }

    const abonos = await abonosController.obtenerAbonos();
    return NextResponse.json(abonos);
  } catch (error) {
    console.error('Error al obtener abonos:', error);
    return NextResponse.json({ error: 'Error al obtener abonos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const abono = await abonosController.crearAbono(data);
    return NextResponse.json(abono, { status: 201 });
  } catch (error) {
    console.error('Error al crear abono:', error);
    return NextResponse.json({ error: 'Error al crear abono' }, { status: 500 });
  }
}
