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

    const formData = await request.formData();
    
    // Convertir FormData a objeto
    const data: any = {};
    formData.forEach((value, key) => {
      if (key === 'imagen') {
        // Manejar el archivo de imagen por separado
        data.imagenFile = value;
      } else {
        data[key] = value;
      }
    });

    // Convertir valores numéricos
    if (data.valorTotal) data.valorTotal = parseFloat(data.valorTotal);
    if (data.pacienteId) data.pacienteId = parseInt(data.pacienteId, 10);
    if (data.faseId) data.faseId = parseInt(data.faseId, 10);

    const caso = await casosController.crearCaso(data);
    return NextResponse.json(caso, { status: 201 });
  } catch (error) {
    console.error('Error al crear caso:', error);
    return NextResponse.json({ error: 'Error al crear caso' }, { status: 500 });
  }
}
