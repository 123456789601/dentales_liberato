/**
 * Dentales Liberato - API de Pacientes
 * Endpoints para gestión de pacientes
 */
import { NextRequest, NextResponse } from 'next/server';
import * as pacientesController from '@/controllers/pacientes.controller';
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
      const pacientes = await pacientesController.buscarPacientes(query);
      return NextResponse.json(pacientes);
    }

    const pacientes = await pacientesController.obtenerPacientes();
    return NextResponse.json(pacientes);
  } catch (error) {
    console.error('Error al obtener pacientes:', error);
    return NextResponse.json({ error: 'Error al obtener pacientes' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const sesion = await obtenerSesionActual();
    if (!sesion) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const data = await request.json();
    const paciente = await pacientesController.crearPaciente(data);
    return NextResponse.json(paciente, { status: 201 });
  } catch (error) {
    console.error('Error al crear paciente:', error);
    return NextResponse.json({ error: 'Error al crear paciente' }, { status: 500 });
  }
}
