/**
 * Dentales Liberato - Controlador de Pacientes
 * Gestión de pacientes del laboratorio dental
 */
import { prisma } from '../lib/prisma';

export async function obtenerPacientes() {
  return await prisma.paciente.findMany({
    where: { activo: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function obtenerPacientePorId(id: number) {
  return await prisma.paciente.findUnique({
    where: { id },
    include: {
      casos: {
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

export async function crearPaciente(data: {
  nombre: string;
  identificacion?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  odontologo?: string;
}) {
  return await prisma.paciente.create({
    data,
  });
}

export async function actualizarPaciente(id: number, data: {
  nombre?: string;
  identificacion?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  odontologo?: string;
  activo?: boolean;
}) {
  return await prisma.paciente.update({
    where: { id },
    data,
  });
}

export async function eliminarPaciente(id: number) {
  return await prisma.paciente.update({
    where: { id },
    data: { activo: false },
  });
}

export async function buscarPacientes(query: string) {
  return await prisma.paciente.findMany({
    where: {
      activo: true,
      OR: [
        { nombre: { contains: query } },
        { identificacion: { contains: query } },
        { telefono: { contains: query } },
      ],
    },
    orderBy: { nombre: 'asc' },
  });
}
