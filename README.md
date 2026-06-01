# Dentales Liberato v2

Sistema completo de inventario clínico dental con **roles y permisos en tablas separadas**.

## Instalación (WAMP)

```bash
cd c:\wamp64\www\liberato
npm install

# Crear/actualizar BD (borra datos previos si hay conflicto de esquema)
npx prisma db push --force-reset
npm run db:seed

npm run dev
```

Abrir: http://localhost:3000/login

## Credenciales

| Rol | Email | Contraseña |
|-----|-------|------------|
| **Administrador** | admin@dentalesliberato.com | Admin123! |
| **Técnico dental** | tecnico@dentalesliberato.com | Tecnico123! |

## Seguridad RBAC

- **roles** — tabla separada (`admin`, `tecnico_dental`)
- **permisos** — catálogo granular (`movimientos.salida`, `productos.crear`, etc.)
- **rol_permisos** — asignación N:N
- JWT incluye lista de permisos del usuario
- Middleware `checkPermission(['permiso.codigo'])` en cada API

## Funcionalidades

### Técnico dental
- Dashboard con métricas personales
- Inventario (lectura, sin precios)
- Salidas de consumo con referencia de paciente
- Historial de movimientos y filtros
- Alertas (stock bajo, vencimientos)
- Solicitudes de reposición
- Reportes básicos y top de consumo

### Administrador
- Todo lo anterior + precios y valor en bodega
- CRUD productos, entradas, ajustes
- Gestión de solicitudes (aprobar/rechazar/surtir)
- Gestión de usuarios y roles
- Exportar CSV (inventario y movimientos)
- Auditoría de acciones críticas

## Estructura clave

```
prisma/schema.prisma     → roles, permisos, rol_permisos
src/lib/permissions.ts   → catálogo de permisos
src/middleware/checkRole.ts → checkPermission()
src/controllers/         → lógica por módulo
```
