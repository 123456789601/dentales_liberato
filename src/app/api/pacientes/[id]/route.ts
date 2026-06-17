/**
 * Dentales Liberato - API de Pacientes por ID
 * Endpoints para gestión individual de pacientes
 */
import { NextRequest, NextResponse } from 'next/server';
import * as pacientesController from '@/controllers/pacientes.controller';
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

    const paciente = await pacientesController.obtenerPacientePorId(Number(params.id));
    if (!paciente) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    }
    return NextResponse.json(paciente);
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    return NextResponse.json({ error: 'Error al obtener paciente' }, { status: 500 });
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
    const paciente = await pacientesController.actualizarPaciente(Number(params.id), data);
    return NextResponse.json(paciente);
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    return NextResponse.json({ error: 'Error al actualizar paciente' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    await pacientesController.eliminarPaciente(Number(params.id));
    return NextResponse.json({ message: 'Paciente eliminado' });
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    return NextResponse.json({ error: 'Error al eliminar paciente' }, { status: 500 });
  }
}
