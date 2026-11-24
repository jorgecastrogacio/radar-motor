import type { Metadata } from 'next';
import './globals.css';
import { Header } from '../components/layout/Header';

export const metadata: Metadata = {
  title: 'RADAR MOTOR — Autoevaluación Motriz Familiar y Escolar',
  description: 'Aplicación client-side de autoevaluación motriz basada en evidencia científica y curvas normativas.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
        <Header />
        <div className="flex-1 flex flex-col">{children}</div>
      </body>
    </html>
  );
}
