'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AppShell } from './AppShell';
import { SessionUser } from '@/hooks/useSession';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [pendientes, setPendientes] = useState(0);

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => {
        if (!r.ok) { router.push('/login'); return null; }
        return r.json();
      })
      .then((d) => {
        if (d?.user) setUser(d.user);
        else router.push('/login');
      });
    fetch('/api/solicitudes/pendientes')
      .then((r) => r.ok ? r.json() : { pendientes: 0 })
      .then((d) => setPendientes(d.pendientes ?? 0));
  }, [router]);

  if (!user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-clinica-600" />
      </div>
    );
  }

  return (
    <AppShell user={user} solicitudesPendientes={pendientes}>
      {children}
    </AppShell>
  );
}
