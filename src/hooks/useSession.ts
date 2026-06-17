'use client';

import { useEffect, useState } from 'react';

export interface SessionUser {
  id: string;
  nombre: string;
  email: string;
  rolCodigo: string;
  rolNombre: string;
  permisos: string[];
}

export function useSession() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => setUser(d?.user ?? null))
      .finally(() => setLoading(false));
  }, []);

  const tiene = (permiso: string) => user?.permisos.includes(permiso) ?? false;

  return { user, loading, tiene, esAdmin: user?.rolCodigo === 'admin' };
}
