import type { Metadata } from 'next';
import './globals.css';

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
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
