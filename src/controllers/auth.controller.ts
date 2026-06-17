import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { autenticarUsuario, crearToken, COOKIE_NAME } from '@/lib/auth';
import { obtenerSesionActual } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export async function login(req: NextRequest): Promise<NextResponse> {
  try {
    const { email, password } = loginSchema.parse(await req.json());
    const result = await autenticarUsuario(email, password);
    if (!result) {
      return NextResponse.json({ error: 'Credenciales incorrectas.' }, { status: 401 });
    }

    const { usuario, permisos } = result;
    const token = await crearToken({
      sub: String(usuario.id),
      email: usuario.email,
      nombre: usuario.nombre,
      rolId: usuario.rolId,
      rolCodigo: usuario.rol.codigo,
      rolNombre: usuario.rol.nombre,
      permisos,
    });

    const response = NextResponse.json({
      message: 'Bienvenido a Dentales Liberato',
      user: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        rolCodigo: usuario.rol.codigo,
        rolNombre: usuario.rol.nombre,
        permisos,
      },
    });

    response.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 8,
    });
    return response;
  } catch (err) {
    if (err instanceof z.ZodError) {
      return NextResponse.json({ error: err.errors[0]?.message }, { status: 400 });
    }
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}

export async function logout(): Promise<NextResponse> {
  const response = NextResponse.json({ message: 'Sesión cerrada' });
  response.cookies.set(COOKIE_NAME, '', { httpOnly: true, path: '/', maxAge: 0 });
  return response;
}

export async function me(): Promise<NextResponse> {
  const sesion = await obtenerSesionActual();
  if (!sesion) return NextResponse.json({ error: 'No autenticado' }, { status: 401 });
  return NextResponse.json({
    user: {
      id: sesion.sub,
      nombre: sesion.nombre,
      email: sesion.email,
      rolCodigo: sesion.rolCodigo,
      rolNombre: sesion.rolNombre,
      permisos: sesion.permisos,
    },
  });
}
