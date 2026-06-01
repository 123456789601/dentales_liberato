/**
 * Dentales Liberato - Autenticación JWT con roles y permisos desde BD
 */
import bcrypt from 'bcrypt';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const COOKIE_NAME = 'dl_session';
const JWT_ALG = 'HS256';

export interface JwtPayload {
  sub: string;
  email: string;
  nombre: string;
  rolId: number;
  rolCodigo: string;
  rolNombre: string;
  permisos: string[];
}

function getSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET debe tener al menos 32 caracteres - Dentales Liberato');
  }
  return new TextEncoder().encode(secret);
}

export async function verificarPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function hashearPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10);
}

/** Carga permisos del rol desde tablas roles + rol_permisos */
export async function obtenerPermisosDeRol(rolId: number): Promise<string[]> {
  const rol = await prisma.rol.findUnique({
    where: { id: rolId },
    include: { permisos: { include: { permiso: true } } },
  });
  if (!rol) return [];
  return rol.permisos.map((rp) => rp.permiso.codigo);
}

export async function crearToken(payload: JwtPayload): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? '8h';
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: JWT_ALG })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getSecret());
}

export async function verificarToken(token: string): Promise<JwtPayload> {
  const { payload } = await jwtVerify(token, getSecret());
  return {
    sub: payload.sub as string,
    email: payload.email as string,
    nombre: payload.nombre as string,
    rolId: payload.rolId as number,
    rolCodigo: payload.rolCodigo as string,
    rolNombre: payload.rolNombre as string,
    permisos: (payload.permisos as string[]) ?? [],
  };
}

export async function autenticarUsuario(email: string, password: string) {
  const usuario = await prisma.usuario.findUnique({
    where: { email: email.toLowerCase().trim() },
    include: { rol: true },
  });
  if (!usuario || !usuario.activo || !usuario.rol.activo) return null;

  const valido = await verificarPassword(password, usuario.passwordHash);
  if (!valido) return null;

  const permisos = await obtenerPermisosDeRol(usuario.rolId);
  return { usuario, permisos };
}

export async function obtenerSesionActual(): Promise<JwtPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  try {
    return await verificarToken(token);
  } catch {
    return null;
  }
}

export function tienePermisoEnSesion(user: JwtPayload, codigo: string): boolean {
  return user.permisos.includes(codigo);
}

export { COOKIE_NAME };
