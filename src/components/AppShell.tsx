'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, ArrowLeftRight, HelpCircle, LogOut, Stethoscope,
  AlertTriangle, ClipboardList, FileBarChart, Users, ClipboardCheck, ShoppingCart,
  Truck, Tags, Shield, ScrollText, User, Search, Wallet, UserCircle, FileText,
  Layers,
} from 'lucide-react';
import { SessionUser } from '@/hooks/useSession';
import { PERMISOS } from '@/lib/permissions';
import { GlobalSearch } from './GlobalSearch';
import { NotificationBell } from './NotificationBell';

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permiso?: string;
  badge?: number;
}

interface AppShellProps {
  children: React.ReactNode;
  user: SessionUser;
  solicitudesPendientes?: number;
}

export function AppShell({ children, user, solicitudesPendientes = 0 }: AppShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const tiene = (p: string) => user.permisos.includes(p);

  const NAV: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/inventario', label: 'Inventario', icon: Package, permiso: PERMISOS.INVENTARIO_VER },
    { href: '/movimientos', label: 'Movimientos', icon: ArrowLeftRight, permiso: PERMISOS.MOVIMIENTOS_VER },
    { href: '/finanzas', label: 'Finanzas', icon: Wallet, permiso: PERMISOS.FINANZAS_VER },
    { href: '/pacientes', label: 'Pacientes', icon: UserCircle, permiso: PERMISOS.PACIENTES_VER },
    { href: '/casos', label: 'Casos', icon: FileText, permiso: PERMISOS.CASOS_VER },
    { href: '/fases-casos', label: 'Fases de Casos', icon: Layers, permiso: PERMISOS.CASOS_EDITAR },
    { href: '/conteos', label: 'Conteo físico', icon: ClipboardCheck, permiso: PERMISOS.CONTEOS_VER },
    { href: '/ordenes', label: 'Órdenes compra', icon: ShoppingCart, permiso: PERMISOS.ORDENES_VER },
    { href: '/alertas', label: 'Alertas', icon: AlertTriangle, permiso: PERMISOS.ALERTAS_VER },
    { href: '/solicitudes', label: 'Solicitudes', icon: ClipboardList, permiso: PERMISOS.SOLICITUDES_CREAR, badge: tiene(PERMISOS.SOLICITUDES_GESTIONAR) ? solicitudesPendientes : undefined },
    { href: '/proveedores', label: 'Proveedores', icon: Truck, permiso: PERMISOS.PROVEEDORES_VER },
    { href: '/categorias', label: 'Categorías', icon: Tags, permiso: PERMISOS.CATEGORIAS_VER },
    { href: '/reportes', label: 'Reportes', icon: FileBarChart, permiso: PERMISOS.REPORTES_VER },
    { href: '/usuarios', label: 'Usuarios', icon: Users, permiso: PERMISOS.USUARIOS_VER },
    { href: '/roles', label: 'Roles', icon: Shield, permiso: PERMISOS.ROLES_VER },
    { href: '/auditoria', label: 'Auditoría', icon: ScrollText, permiso: PERMISOS.AUDITORIA_VER },
    { href: '/perfil', label: 'Mi perfil', icon: User },
    { href: '/ayuda', label: 'Ayuda', icon: HelpCircle },
  ];

  const navVisible = NAV.filter((n) => !n.permiso || tiene(n.permiso));

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="hidden w-60 flex-col border-r border-slate-200 bg-white xl:flex xl:w-64">
        <div className="flex items-center gap-2 border-b border-slate-100 px-5 py-4">
          <img src="/logo.jpg" alt="Dentales Liberato" className="h-7 w-7 object-contain shrink-0" />
          <div className="min-w-0">
            <p className="font-bold text-clinica-800 truncate">Dentales Liberato</p>
            <p className="text-xs text-slate-400 truncate">{user.rolNombre}</p>
          </div>
        </div>
        <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
          {navVisible.map(({ href, label, icon: Icon, badge }) => (
            <Link key={href} href={href}
              className={`flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition ${
                pathname === href || pathname.startsWith(href + '/')
                  ? 'bg-clinica-50 text-clinica-700' : 'text-slate-600 hover:bg-slate-50'
              }`}>
              <span className="flex items-center gap-2.5 min-w-0">
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{label}</span>
              </span>
              {badge && badge > 0 ? (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] text-white shrink-0">{badge}</span>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="border-t border-slate-100 p-3">
          <p className="mb-2 truncate px-2 text-xs text-slate-500">{user.nombre}</p>
          <button type="button" onClick={logout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50">
            <LogOut className="h-4 w-4" /> Cerrar sesión
          </button>
        </div>
      </aside>
      <main className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3">
          <p className="font-bold text-clinica-800 xl:hidden">Dentales Liberato</p>
          <div className="flex flex-1 items-center gap-3 min-w-0">
            <GlobalSearch />
          </div>
          <NotificationBell />
          <Link href="/perfil" className="hidden sm:flex items-center gap-2 rounded-lg px-2 py-1 hover:bg-slate-50 text-sm text-slate-600">
            <User className="h-4 w-4" />
            <span className="max-w-[120px] truncate">{user.nombre.split(' ')[0]}</span>
          </Link>
        </header>
        <div className="flex-1 p-4 lg:p-6 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
