/**
 * Dentales Liberato - API de Abonos por ID
 * Endpoints para gestión individual de abonos
 */
import { NextRequest, NextResponse } from 'next/server';
import * as abonosController from '@/controllers/abonos.controller';
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

    const abono = await abonosController.obtenerAbonoPorId(Number(params.id));
    if (!abono) {
      return NextResponse.json({ error: 'Abono no encontrado' }, { status: 404 });
    }
    return NextResponse.json(abono);
  } catch (error) {
    console.error('Error al obtener abono:', error);
    return NextResponse.json({ error: 'Error al obtener abono' }, { status: 500 });
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

    await abonosController.eliminarAbono(Number(params.id));
    return NextResponse.json({ message: 'Abono eliminado' });
  } catch (error) {
    console.error('Error al eliminar abono:', error);
    return NextResponse.json({ error: 'Error al eliminar abono' }, { status: 500 });
  }
}
