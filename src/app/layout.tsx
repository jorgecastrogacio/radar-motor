import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '../components/layout/Header';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://radar-motor.vercel.app';

export const metadata: Metadata = {
  title: 'RADAR MOTOR — Comprueba tu mapa de salud motriz en casa',
  description:
    'Autoevaluación motriz 100% client-side para todas las edades (6 a 80+ años). Baremos científicos, sin registro y cumplimiento estricto RGPD.',
  keywords: [
    'radar motor',
    'autoevaluación motriz',
    'salud familiar',
    'educación física',
    'baremos normativos',
    'ejercicio en casa',
    'condición física',
  ],
  authors: [{ name: 'RADAR MOTOR' }],
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    title: 'RADAR MOTOR — Comprueba tu mapa de salud motriz en casa',
    description:
      'Descubre tu arquetipo motor y tu radar de 6 capacidades con pruebas validadas desde el salón. Cero registro, coste 0 €.',
    url: siteUrl,
    siteName: 'RADAR MOTOR',
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RADAR MOTOR — Comprueba tu mapa de salud motriz en casa',
    description:
      'Descubre tu arquetipo motor y tu radar de 6 capacidades desde casa. 100% privado en tu navegador.',
  },
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#2563eb',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
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
