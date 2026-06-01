/**
 * Dentales Liberato - API de Casos
 * Endpoints para gestión de casos/trabajos dentales
 */
import { NextRequest, NextResponse } from 'next/server';
import * as casosController from '@/controllers/casos.controller';
import { obtenerSesionActual } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');

    if (query) {
      const casos = await casosController.buscarCasos(query);
      return NextResponse.json(casos);
    }

    const casos = await casosController.obtenerCasos();
    return NextResponse.json(casos);
  } catch (error) {
    console.error('Error al obtener casos:', error);
    return NextResponse.json({ error: 'Error al obtener casos' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const caso = await casosController.crearCaso(data);
    return NextResponse.json(caso, { status: 201 });
  } catch (error) {
    console.error('Error al crear caso:', error);
    return NextResponse.json({ error: 'Error al crear caso' }, { status: 500 });
  }
}
