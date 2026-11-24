export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-50 text-slate-900">
      <div className="max-w-md w-full bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
        <h1 className="text-2xl font-bold text-slate-900">RADAR MOTOR</h1>
        <p className="text-sm text-slate-600 mt-2">
          Fase 1: Motor de Baremos y Algoritmo de Puntuación (`feat/core-engine`).
        </p>
        <div className="mt-4 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
          Núcleo activo: 792 baremos normativos calibrados
        </div>
      </div>
    </main>
  );
}
