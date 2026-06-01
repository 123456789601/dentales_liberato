/**
 * Dentales Liberato - Middleware RBAC por permisos (tabla roles separada)
 */
import { NextRequest, NextResponse } from 'next/server';
import { verificarToken, JwtPayload, COOKIE_NAME, tienePermisoEnSesion } from '@/lib/auth';

export type ApiHandler = (
  req: NextRequest,
  context: { user: JwtPayload; params?: Record<string, string> }
) => Promise<NextResponse>;

async function obtenerUsuario(req: NextRequest): Promise<JwtPayload | NextResponse> {
  const token =
    req.cookies.get(COOKIE_NAME)?.value ??
    req.headers.get('authorization')?.replace(/^Bearer\s+/i, '');

  if (!token) {
    return NextResponse.json({ error: 'No autenticado. Inicie sesión en Dentales Liberato.' }, { status: 401 });
  }

  try {
    return await verificarToken(token);
  } catch {
    return NextResponse.json({ error: 'Sesión inválida o expirada.' }, { status: 401 });
  }
}

/**
 * Exige uno o más permisos (desde tabla rol_permisos)
 * Uso: checkPermission(['movimientos.salida'], handler)
 */
export function checkPermission(permisosRequeridos: string[], handler: ApiHandler) {
  return async (req: NextRequest, routeContext?: { params?: Record<string, string> }): Promise<NextResponse> => {
    const result = await obtenerUsuario(req);
    if (result instanceof NextResponse) return result;
    const user = result;

    const tieneAlguno = permisosRequeridos.some((p) => tienePermisoEnSesion(user, p));
    if (!tieneAlguno) {
      return NextResponse.json(
        {
          error: 'Acceso denegado. No tiene permisos para esta operación.',
          permisosRequeridos,
          rol: user.rolCodigo,
        },
        { status: 403 }
      );
    }

    return handler(req, { user, params: routeContext?.params });
  };
}

/** Exige que el rol (código) esté en la lista — compatibilidad */
export function checkRole(codigosRol: string[], handler: ApiHandler) {
  return async (req: NextRequest, routeContext?: { params?: Record<string, string> }): Promise<NextResponse> => {
    const result = await obtenerUsuario(req);
    if (result instanceof NextResponse) return result;
    const user = result;

    if (!codigosRol.includes(user.rolCodigo)) {
      return NextResponse.json({ error: 'Rol no autorizado.', rolActual: user.rolCodigo }, { status: 403 });
    }

    return handler(req, { user, params: routeContext?.params });
  };
}

/** Cualquier usuario autenticado con al menos un permiso activo */
export function requireAuth(handler: ApiHandler) {
  return async (req: NextRequest, routeContext?: { params?: Record<string, string> }): Promise<NextResponse> => {
    const result = await obtenerUsuario(req);
    if (result instanceof NextResponse) return result;
    return handler(req, { user: result, params: routeContext?.params });
  };
}

import { PERMISOS } from '@/lib/permissions';

export function puedeVerCostos(user: JwtPayload): boolean {
  return tienePermisoEnSesion(user, PERMISOS.INVENTARIO_VER_COSTOS) ||
    tienePermisoEnSesion(user, PERMISOS.DASHBOARD_VER_COSTOS);
}

export function puedeEditarPrecios(user: JwtPayload): boolean {
  return tienePermisoEnSesion(user, PERMISOS.PRODUCTOS_EDITAR_PRECIO);
}

export function puedeEliminarProductos(user: JwtPayload): boolean {
  return tienePermisoEnSesion(user, PERMISOS.PRODUCTOS_ELIMINAR);
}
