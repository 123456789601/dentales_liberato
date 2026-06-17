import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Dentales Liberato - Inventario Clínico',
  description: 'Sistema de gestión de inventario dental - Dentales Liberato',
  icons: {
    icon: '/logo.jpg',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans`}>{children}</body>
    </html>
  );
}
