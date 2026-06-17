/**
 * Dentales Liberato - Semilla: roles, permisos, usuarios, datos demo
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { TODOS_PERMISOS, PERMISOS_TECNICO } from '../src/lib/permissions';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'admin@dentalesliberato.com';
const ADMIN_PASSWORD = 'Admin123!';
const TECNICO_EMAIL = 'tecnico@dentalesliberato.com';
const TECNICO_PASSWORD = 'Tecnico123!';

async function main() {
  // --- Permisos ---
  for (const p of TODOS_PERMISOS) {
    await prisma.permiso.upsert({
      where: { codigo: p.codigo },
      update: { nombre: p.nombre, modulo: p.modulo, descripcion: p.descripcion },
      create: p,
    });
  }

  const todosPermisoRecords = await prisma.permiso.findMany();
  const permisoByCodigo = Object.fromEntries(todosPermisoRecords.map((p) => [p.codigo, p.id]));

  // --- Roles ---
  const rolAdmin = await prisma.rol.upsert({
    where: { codigo: 'admin' },
    update: { nombre: 'Administrador', descripcion: 'Acceso total al sistema Dentales Liberato' },
    create: {
      codigo: 'admin',
      nombre: 'Administrador',
      descripcion: 'Acceso total al sistema Dentales Liberato',
    },
  });

  const rolTecnico = await prisma.rol.upsert({
    where: { codigo: 'tecnico_dental' },
    update: { nombre: 'Técnico Dental', descripcion: 'Inventariado y consumo clínico' },
    create: {
      codigo: 'tecnico_dental',
      nombre: 'Técnico Dental',
      descripcion: 'Inventariado, salidas, solicitudes y alertas',
    },
  });

  // Admin: todos los permisos
  for (const p of todosPermisoRecords) {
    await prisma.rolPermiso.upsert({
      where: { rolId_permisoId: { rolId: rolAdmin.id, permisoId: p.id } },
      update: {},
      create: { rolId: rolAdmin.id, permisoId: p.id },
    });
  }

  // Técnico: permisos limitados
  for (const codigo of PERMISOS_TECNICO) {
    const permisoId = permisoByCodigo[codigo];
    if (permisoId) {
      await prisma.rolPermiso.upsert({
        where: { rolId_permisoId: { rolId: rolTecnico.id, permisoId } },
        update: {},
        create: { rolId: rolTecnico.id, permisoId },
      });
    }
  }

  const adminHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
  const tecnicoHash = await bcrypt.hash(TECNICO_PASSWORD, 10);

  await prisma.usuario.upsert({
    where: { email: ADMIN_EMAIL },
    update: { passwordHash: adminHash, rolId: rolAdmin.id, nombre: 'Administrador Dentales Liberato' },
    create: {
      nombre: 'Administrador Dentales Liberato',
      email: ADMIN_EMAIL,
      passwordHash: adminHash,
      rolId: rolAdmin.id,
    },
  });

  await prisma.usuario.upsert({
    where: { email: TECNICO_EMAIL },
    update: { passwordHash: tecnicoHash, rolId: rolTecnico.id, nombre: 'Técnico Dental Demo' },
    create: {
      nombre: 'Técnico Dental Demo',
      email: TECNICO_EMAIL,
      passwordHash: tecnicoHash,
      rolId: rolTecnico.id,
    },
  });

  // --- Categorías y productos demo ---
  const categorias = [
    { nombre: 'Ortodoncia', descripcion: 'Brackets, arcos, ligaduras' },
    { nombre: 'Quirúrgico', descripcion: 'Material quirúrgico dental' },
    { nombre: 'Desechables', descripcion: 'Guantes, mascarillas, gasas' },
    { nombre: 'Químicos', descripcion: 'Desinfectantes y resinas' },
  ];

  for (const cat of categorias) {
    await prisma.categoria.upsert({ where: { nombre: cat.nombre }, update: {}, create: cat });
  }

  let proveedor = await prisma.proveedor.findFirst();
  if (!proveedor) {
    proveedor = await prisma.proveedor.create({
      data: { nombre: 'Dental Supply Colombia', contacto: 'Ventas', telefono: '3001234567', email: 'ventas@dental.com' },
    });
  }

  const desechables = await prisma.categoria.findUnique({ where: { nombre: 'Desechables' } });
  const quimicos = await prisma.categoria.findUnique({ where: { nombre: 'Químicos' } });
  const ortodoncia = await prisma.categoria.findUnique({ where: { nombre: 'Ortodoncia' } });

  if (desechables) {
    await prisma.producto.upsert({
      where: { skuCode: 'DL-GUA-001' },
      update: {},
      create: {
        nombre: 'Guantes de látex talla M',
        descripcion: 'Caja x 100 unidades',
        skuCode: 'DL-GUA-001',
        stockActual: 50,
        stockMinimo: 20,
        unidadMedida: 'caja',
        cantidadPorCaja: 100,
        precioCompra: 10000,
        precioUnitario: 12500,
        costoPorUnidad: 100,
        ubicacionBodega: 'Estante A-1',
        fechaVencimiento: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        categoriaId: desechables.id,
        proveedorId: proveedor.id,
      },
    });
  }

  if (quimicos) {
    await prisma.producto.upsert({
      where: { skuCode: 'DL-QUI-002' },
      update: {},
      create: {
        nombre: 'Resina compuesta A2',
        descripcion: 'Jeringa 4g',
        skuCode: 'DL-QUI-002',
        stockActual: 8,
        stockMinimo: 10,
        unidadMedida: 'gramo',
        cantidadPorCaja: 4,
        precioCompra: 35000,
        precioUnitario: 45000,
        costoPorUnidad: 8750,
        ubicacionBodega: 'Estante B-3',
        fechaVencimiento: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        categoriaId: quimicos.id,
        proveedorId: proveedor.id,
      },
    });
  }

  if (ortodoncia) {
    await prisma.producto.upsert({
      where: { skuCode: 'DL-ORT-003' },
      update: {},
      create: {
        nombre: 'Brackets metálicos',
        descripcion: 'Set inicial ortodoncia',
        skuCode: 'DL-ORT-003',
        stockActual: 3,
        stockMinimo: 5,
        unidadMedida: 'unidad',
        cantidadPorCaja: 1,
        precioCompra: 75000,
        precioUnitario: 89000,
        costoPorUnidad: 75000,
        ubicacionBodega: 'Estante C-2',
        fechaVencimiento: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        categoriaId: ortodoncia.id,
      },
    });
  }

  // --- Pacientes demo ---
  const paciente1 = await prisma.paciente.upsert({
    where: { identificacion: '12345678' },
    update: {},
    create: {
      nombre: 'María García López',
      identificacion: '12345678',
      telefono: '3105551234',
      email: 'maria.garcia@email.com',
      direccion: 'Calle 123 #45-67, Bogotá',
      odontologo: 'Dr. Carlos Rodríguez',
    },
  });

  const paciente2 = await prisma.paciente.upsert({
    where: { identificacion: '87654321' },
    update: {},
    create: {
      nombre: 'Juan Pérez Martínez',
      identificacion: '87654321',
      telefono: '3205555678',
      email: 'juan.perez@email.com',
      direccion: 'Avenida 45 #67-89, Bogotá',
      odontologo: 'Dra. Ana María López',
    },
  });

  // --- Casos demo ---
  const caso1 = await prisma.caso.upsert({
    where: { codigo: 'CAS-2024-001' },
    update: {},
    create: {
      codigo: 'CAS-2024-001',
      pacienteId: paciente1.id,
      descripcion: 'Corona de porcelana en pieza 16',
      estado: 'en_progreso',
      valorTotal: 350000,
      costoMateriales: 0,
      costoProduccion: 0,
      gananciaProyectada: 350000,
      fechaEntrega: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      notas: 'Urgente - paciente con dolor',
    },
  });

  const caso2 = await prisma.caso.upsert({
    where: { codigo: 'CAS-2024-002' },
    update: {},
    create: {
      codigo: 'CAS-2024-002',
      pacienteId: paciente2.id,
      descripcion: 'Prótesis dental removible superior',
      estado: 'pendiente',
      valorTotal: 850000,
      costoMateriales: 0,
      costoProduccion: 0,
      gananciaProyectada: 850000,
      fechaEntrega: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      notas: 'Requiere toma de medidas',
    },
  });

  // --- Cuentas por cobrar ---
  const cuenta1 = await prisma.cuenta.upsert({
    where: { casoId: caso1.id },
    update: {},
    create: {
      casoId: caso1.id,
      tipo: 'por_cobrar',
      valorTotal: 350000,
      valorPagado: 150000,
      saldoPendiente: 200000,
      fechaVencimiento: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      estado: 'pendiente',
      notas: 'Abono inicial recibido',
    },
  });

  const cuenta2 = await prisma.cuenta.upsert({
    where: { casoId: caso2.id },
    update: {},
    create: {
      casoId: caso2.id,
      tipo: 'por_cobrar',
      valorTotal: 850000,
      valorPagado: 0,
      saldoPendiente: 850000,
      fechaVencimiento: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      estado: 'pendiente',
    },
  });

  // --- Abonos demo ---
  await prisma.abono.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      cuentaId: cuenta1.id,
      casoId: caso1.id,
      monto: 150000,
      metodo: 'Efectivo',
      referencia: 'REC-001',
      notas: 'Abono inicial',
      fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  // --- Transacciones financieras demo ---
  await prisma.transaccion.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      tipo: 'ingreso',
      monto: 150000,
      descripcion: 'Abono inicial caso CAS-2024-001',
      referencia: 'REC-001',
      categoria: 'abonos',
      fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.transaccion.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      tipo: 'gasto',
      monto: 500000,
      descripcion: 'Compra de materiales dentales',
      referencia: 'COMP-001',
      categoria: 'compras',
      fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  // --- Movimientos de caja demo ---
  await prisma.caja.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      tipo: 'ingreso',
      monto: 150000,
      saldoAnterior: 0,
      saldoPosterior: 150000,
      descripcion: 'Abono inicial caso CAS-2024-001',
      referencia: 'REC-001',
      transaccionId: 1,
      fecha: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.caja.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      tipo: 'egreso',
      monto: 500000,
      saldoAnterior: 150000,
      saldoPosterior: -350000,
      descripcion: 'Compra de materiales dentales',
      referencia: 'COMP-001',
      transaccionId: 2,
      fecha: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✓ Dentales Liberato - Semilla completada');
  console.log(`  Admin:   ${ADMIN_EMAIL} / ${ADMIN_PASSWORD}`);
  console.log(`  Técnico: ${TECNICO_EMAIL} / ${TECNICO_PASSWORD}`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
