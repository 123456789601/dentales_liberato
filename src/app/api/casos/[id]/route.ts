/**
 * Dentales Liberato - API de Casos por ID
 * Endpoints para gestión individual de casos
 */
import { NextRequest, NextResponse } from 'next/server';
import * as casosController from '@/controllers/casos.controller';
import { obtenerSesionActual } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const caso = await casosController.obtenerCasoPorId(Number(params.id));
    if (!caso) {
      return NextResponse.json({ error: 'Caso no encontrado' }, { status: 404 });
    }
    return NextResponse.json(caso);
  } catch (error) {
    console.error('Error al obtener caso:', error);
    return NextResponse.json({ error: 'Error al obtener caso' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const caso = await casosController.actualizarCaso(Number(params.id), data);
    return NextResponse.json(caso);
  } catch (error) {
    console.error('Error al actualizar caso:', error);
    return NextResponse.json({ error: 'Error al actualizar caso' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    
    if (data.accion === 'completar') {
      const caso = await casosController.completarCaso(Number(params.id));
      return NextResponse.json(caso);
    }
    
    if (data.accion === 'agregar_material') {
      const casoMaterial = await casosController.agregarMaterialACaso(
        Number(params.id),
        data.productoId,
        data.cantidad
      );
      return NextResponse.json(casoMaterial);
    }

    if (data.accion === 'eliminar_material') {
      await casosController.eliminarMaterialDeCaso(Number(params.id), data.productoId);
      return NextResponse.json({ message: 'Material eliminado' });
    }

    return NextResponse.json({ error: 'Acción no reconocida' }, { status: 400 });
  } catch (error) {
    console.error('Error al procesar acción del caso:', error);
    return NextResponse.json({ error: 'Error al procesar acción' }, { status: 500 });
  }
}
