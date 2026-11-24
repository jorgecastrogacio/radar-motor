import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'RADAR MOTOR — Autoevaluación Motriz Familiar y Escolar',
    short_name: 'Radar Motor',
    description:
      'Autoevaluación motriz 100% en cliente, científica, familiar y escolar. Cero registro, cero servidores y privacidad estricta RGPD.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#2563eb',
    lang: 'es',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}
