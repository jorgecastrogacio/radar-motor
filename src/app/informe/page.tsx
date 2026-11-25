'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Activity,
  ArrowRight,
  Calendar,
  Check,
  CheckCircle2,
  Compass,
  Copy,
  Download,
  Feather,
  Flame,
  Printer,
  RotateCcw,
  Share2,
  Shield,
  ShieldCheck,
  Sparkles,
  Sprout,
  Users,
  Zap,
} from 'lucide-react';
import { ALL_AXIS_IDS, AXES_CONFIG } from '../../data/tests-catalog';
import { CATEGORY_THEMES } from '../../data/category-theme';
import { loadLastReport, SavedReport } from '../../lib/session-store';
import { determineArchetype, MotorArchetype } from '../../data/archetypes';
import { getRecommendedMicroChallenges, MicroChallenge } from '../../data/micro-challenges';
import { RadarChartSvg, RadarSeries } from '../../components/report/RadarChartSvg';
import { FamilyPassportPrint } from '../../components/report/FamilyPassportPrint';
import {
  buildChallengeUrl,
  ChallengePayload,
  decodeChallengePayload,
  downloadNinetyDayReminderICS,
  getPersonalHistory,
  HistoryEntry,
  saveReportToHistory,
} from '../../lib/share-codec';
import { downloadRadarCardPNG, shareRadarCardPNG } from '../../lib/canvas-exporter';

function ArchetypeIcon({ name, className = 'h-6 w-6' }: { name: string; className?: string }) {
  switch (name) {
    case 'Zap':
      return <Zap className={className} />;
    case 'Shield':
      return <Shield className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Feather':
      return <Feather className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Sprout':
      return <Sprout className={className} />;
    case 'Compass':
    default:
      return <Compass className={className} />;
  }
}

function InformeContent() {
  const searchParams = useSearchParams();
  const challengeParam = searchParams.get('reto');

  const [savedData, setSavedData] = useState<SavedReport | null>(null);
  const [selectedParticipantIdx, setSelectedParticipantIdx] = useState(0);
  const [challengeData, setChallengeData] = useState<ChallengePayload | null>(null);
  const [comparisonMode, setComparisonMode] = useState<string>('none');
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [personalHistory, setPersonalHistory] = useState<HistoryEntry[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const reportData = loadLastReport();
    setSavedData(reportData);

    if (reportData && reportData.items.length > 0) {
      const activeItem = reportData.items[0];
      saveReportToHistory(activeItem.report, activeItem.participant.alias);
      setPersonalHistory(getPersonalHistory());
    }

    if (challengeParam) {
      const decoded = decodeChallengePayload(challengeParam);
      if (decoded) {
        setChallengeData(decoded);
        setComparisonMode('challenge');
      }
    }
  }, [challengeParam]);

  if (!savedData || savedData.items.length === 0) {
    return (
      <main className="flex-1 max-w-2xl w-full mx-auto px-4 py-16 text-center space-y-6">
        <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
          <Activity className="h-8 w-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">
            Aún no hay ningún informe generado
          </h1>
          <p className="text-sm text-slate-600 max-w-md mx-auto">
            Completa tu autoevaluación motriz (Reto Exprés o Chequeo Completo) para generar tu mapa funcional de salud.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/evaluar"
            className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm transition-all"
          >
            <span>Comenzar evaluación ahora</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 min-h-[48px] px-6 py-3 rounded-2xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all"
          >
            <span>Volver a la portada</span>
          </Link>
        </div>
      </main>
    );
  }

  const currentItem = savedData.items[selectedParticipantIdx] || savedData.items[0];
  const { participant, report } = currentItem;

  const isFamily = savedData.mode === 'family';
  const isExpress = savedData.mode === 'express';

  const archetype: MotorArchetype = determineArchetype(report);
  const microChallenges: MicroChallenge[] = getRecommendedMicroChallenges(report, 2);

  // Construir serie primaria del radar
  const primaryAxisScores: Partial<Record<string, number>> = {};
  if (report.axisResults) {
    for (const [k, v] of Object.entries(report.axisResults)) {
      if (v) primaryAxisScores[k] = v.score;
    }
  }

  const primarySeries: RadarSeries = {
    label: participant.alias,
    scores: primaryAxisScores,
  };

  // Construir serie de comparación según el modo seleccionado
  let comparisonSeries: RadarSeries | null = null;
  if (comparisonMode === 'challenge' && challengeData) {
    comparisonSeries = {
      label: `Reto: ${challengeData.alias}`,
      scores: challengeData.axisScores,
      isComparison: true,
    };
  } else if (comparisonMode.startsWith('family_')) {
    const fIdx = parseInt(comparisonMode.replace('family_', ''), 10);
    const fItem = savedData.items[fIdx];
    if (fItem && fItem.participant.id !== participant.id) {
      const fScores: Partial<Record<string, number>> = {};
      for (const [k, v] of Object.entries(fItem.report.axisResults || {})) {
        if (v) fScores[k] = v.score;
      }
      comparisonSeries = {
        label: fItem.participant.alias,
        scores: fScores,
        isComparison: true,
      };
    }
  } else if (comparisonMode.startsWith('history_')) {
    const hId = comparisonMode.replace('history_', '');
    const hItem = personalHistory.find((h) => h.id === hId);
    if (hItem) {
      comparisonSeries = {
        label: `Histórico (${new Date(hItem.date).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })})`,
        scores: hItem.axisScores,
        isComparison: true,
      };
    }
  }

  const handleCopyChallengeUrl = () => {
    if (typeof window === 'undefined') return;
    const url = buildChallengeUrl(report, window.location.origin, participant.alias);
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        setCopyFeedback(true);
        setTimeout(() => setCopyFeedback(false), 3000);
      });
    }
  };

  const handleSharePNG = async (format: 'square' | 'story') => {
    setIsExporting(true);
    try {
      await shareRadarCardPNG(report, format, participant.alias);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadPNG = async (format: 'square' | 'story') => {
    setIsExporting(true);
    try {
      await downloadRadarCardPNG(report, format, participant.alias);
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadICS = () => {
    downloadNinetyDayReminderICS(participant.alias);
  };

  return (
    <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 space-y-10">
      {/* Banner de Desafío Recibido (?reto=...) */}
      {challengeData && (
        <div className="rounded-3xl border-2 border-amber-400 bg-amber-50/80 p-5 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-2xl bg-amber-200 text-amber-900 shrink-0">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <p className="font-extrabold text-amber-950 text-sm">
                Desafío Recibido de {challengeData.alias} ({challengeData.age} años)
              </p>
              <p className="text-xs text-amber-800">
                Puntuación del rival: <strong className="tabular-nums">{challengeData.globalAverage !== undefined ? `${challengeData.globalAverage} pts (/ 100)` : `${challengeData.globalScore} pts`}</strong> · Superpuesto en tu gráfico de radar.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setComparisonMode(comparisonMode === 'challenge' ? 'none' : 'challenge')}
            className="shrink-0 text-xs font-bold px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white transition-colors"
          >
            {comparisonMode === 'challenge' ? 'Ocultar Rival' : 'Superponer Rival'}
          </button>
        </div>
      )}

      {/* Selector de Miembros Familiares si es Modo Familia */}
      {isFamily && savedData.items.length > 1 && (
        <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-2 print:hidden">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
            Participantes evaluados ({savedData.items.length}):
          </span>
          <div className="flex flex-wrap gap-2">
            {savedData.items.map((item, idx) => (
              <button
                key={item.participant.id}
                type="button"
                onClick={() => {
                  setSelectedParticipantIdx(idx);
                  setComparisonMode('none');
                }}
                className={`min-h-[42px] px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  selectedParticipantIdx === idx
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <Users className="h-4 w-4" />
                <span>{item.participant.alias} ({item.participant.age}a)</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Cabecera del Arquetipo Motor */}
      <section className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 space-y-6 shadow-md relative overflow-hidden print:hidden">
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-sky-300">
              <ArchetypeIcon name={archetype.iconName} className="h-4 w-4" />
              <span>ARQUETIPO MOTOR: {archetype.badge.toUpperCase()}</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              {archetype.name}
            </h1>
            <p className="text-sm font-medium text-slate-300">
              {participant.alias} ({participant.age} años) · {archetype.subtitle}
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-4 text-center sm:text-right shrink-0">
            <span className="text-[11px] uppercase tracking-wider text-slate-300 block">
              Puntuación Media
            </span>
            <div className="flex items-baseline justify-center sm:justify-end gap-1">
              <span className="text-4xl font-mono font-black text-sky-400 tabular-nums">
                {Math.round(report.globalAverage)}
              </span>
              <span className="text-xs text-slate-400">/ 100</span>
            </div>
            <span className="inline-block mt-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Nivel: {report.globalAverage >= 85 ? 'Referente' : report.globalAverage >= 55 ? 'Sólido' : report.globalAverage >= 25 ? 'En Progreso' : 'Base'}
            </span>
          </div>
        </div>

        {/* Descripción Constructiva */}
        <div className="relative z-10 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs sm:text-sm text-slate-200">
          <div className="space-y-1 bg-white/5 p-3.5 rounded-xl border border-white/10">
            <p className="font-bold text-sky-300 flex items-center gap-1.5">
              <span>⚡</span> Tu Superpoder Motor
            </p>
            <p className="leading-relaxed text-slate-300">{archetype.strengthsText}</p>
          </div>
          <div className="space-y-1 bg-white/5 p-3.5 rounded-xl border border-white/10">
            <p className="font-bold text-amber-300 flex items-center gap-1.5">
              <span>🌱</span> Tu Oportunidad de Crecimiento
            </p>
            <p className="leading-relaxed text-slate-300">{archetype.opportunityText}</p>
          </div>
        </div>
      </section>

      {/* Gráfico Radar Interactivo de 6 Ejes - VISTA DE MAPA OFICIAL (#0F172A) */}
      <section className="rounded-[22px] border border-slate-800 bg-[#0F172A] p-6 sm:p-8 space-y-6 shadow-xl print:hidden text-white">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#FACC15] text-[#0F172A] mb-2 shadow-xs">
              <span>★</span>
              <span>VISTA DE MAPA RADAR</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2 tracking-tight">
              <Compass className="h-5 w-5 text-[#FACC15]" />
              <span>Mapa Biomotor de 6 Ejes</span>
            </h2>
            <p className="text-xs text-[#CBD5E1] mt-0.5">
              Compara tus resultados con la Zona Saludable Motriz (45–75 pts) o superpón a otro miembro.
            </p>
          </div>

          {/* Selector de Comparación */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <label htmlFor="comparison-select" className="text-xs font-semibold text-[#CBD5E1] whitespace-nowrap">
              Superponer:
            </label>
            <select
              id="comparison-select"
              value={comparisonMode}
              onChange={(e) => setComparisonMode(e.target.value)}
              className="text-xs font-medium rounded-xl border border-slate-700 bg-[#1E293B] py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-[#2563EB] cursor-pointer w-full sm:w-auto"
            >
              <option value="none">Sin superposición</option>
              {challengeData && (
                <option value="challenge">Reto: {challengeData.alias}</option>
              )}
              {isFamily &&
                savedData.items
                  .map((item, idx) => ({ item, idx }))
                  .filter(({ idx }) => idx !== selectedParticipantIdx)
                  .map(({ item, idx }) => (
                    <option key={`comp-fam-${item.participant.id}`} value={`family_${idx}`}>
                      Familia: {item.participant.alias}
                    </option>
                  ))}
              {personalHistory
                .filter((h) => h.alias !== participant.alias || new Date(h.date).getTime() < Date.now() - 10000)
                .slice(0, 3)
                .map((h) => (
                  <option key={`comp-hist-${h.id}`} value={`history_${h.id}`}>
                    Historial: {h.alias} ({new Date(h.date).toLocaleDateString('es-ES')})
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* El Gráfico SVG Puro sobre fondo de mapa */}
        <div className="py-2">
          <RadarChartSvg
            primarySeries={primarySeries}
            comparisonSeries={comparisonSeries}
            themeVariant="map_dark"
          />
        </div>
      </section>

      {/* Barra de Herramientas de Compartición y Viralidad */}
      <section className="rounded-3xl border border-slate-200 bg-slate-50 p-6 space-y-4 shadow-xs print:hidden">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-blue-600" />
            <span>Comparte tu Radar o Desafía a tu Entorno</span>
          </h3>
          <p className="text-xs text-slate-600">
            Exporta tu tarjeta gráfica PNG para WhatsApp/Instagram sin servidores ni marcas de agua.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Botón Cuadrada PNG (1080x1080) */}
          <button
            type="button"
            onClick={() => handleSharePNG('square')}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4 text-blue-600" />
            <span>Tarjeta WhatsApp (1:1)</span>
          </button>

          {/* Botón Story PNG (1080x1920) */}
          <button
            type="button"
            onClick={() => handleDownloadPNG('story')}
            disabled={isExporting}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-slate-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Download className="h-4 w-4 text-indigo-600" />
            <span>Tarjeta Stories (9:16)</span>
          </button>

          {/* Botón Copiar Enlace de Desafío */}
          <button
            type="button"
            onClick={handleCopyChallengeUrl}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-300 hover:border-amber-500 hover:bg-amber-50/50 text-slate-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {copyFeedback ? (
              <>
                <Check className="h-4 w-4 text-emerald-600" />
                <span className="text-emerald-700">¡Enlace Copiado!</span>
              </>
            ) : (
              <>
                <Copy className="h-4 w-4 text-amber-600" />
                <span>Copiar Enlace de Reto</span>
              </>
            )}
          </button>

          {/* Botón Recordatorio a 90 días (.ics) */}
          <button
            type="button"
            onClick={handleDownloadICS}
            className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-white border border-slate-300 hover:border-emerald-500 hover:bg-emerald-50/50 text-slate-800 text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            <Calendar className="h-4 w-4 text-emerald-600" />
            <span>Reevaluación a 90 Días</span>
          </button>
        </div>
      </section>

      {/* Los 2 Micro-Retos Domésticos Recomendados */}
      <section className="space-y-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            <span>Micro-Retos Personalizados (2–3 min/día)</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Hábitos sencillos y sin gimnasio diseñados para impulsar tus ejes con mayor margen de mejora.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {microChallenges.filter(Boolean).map((mc, idx) => (
            <div
              key={mc.id || `mc-${idx}`}
              className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full">
                  Reto #{idx + 1} · {mc.durationMinutes || 2} min/día
                </span>
                <span className="text-xs text-slate-500 font-medium">{mc.frequency}</span>
              </div>

              <div>
                <h3 className="font-bold text-base text-slate-900">{mc.title}</h3>
                <p className="text-xs text-slate-600 mt-1">{mc.description}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                <p className="font-semibold text-slate-800">Cómo realizarlo:</p>
                <p className="text-slate-600 leading-relaxed">{mc.instruction}</p>
              </div>

              <p className="text-[11px] text-amber-800 bg-amber-50/80 px-3 py-1.5 rounded-lg border border-amber-200">
                💡 <strong>Consejo en casa:</strong> {mc.homeTip}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Desglose Detallado por los 6 Ejes */}
      <section className="space-y-4 print:hidden">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span>Desglose por Categorías y Pruebas Realizadas</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Resultados individuales ordenados según el currículo biomotor oficial de 6 categorías.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALL_AXIS_IDS.map((axisId) => {
            const ax = report.axisResults?.[axisId];
            if (!ax) return null;
            const catTheme = CATEGORY_THEMES[axisId];

            return (
              <div
                key={axisId}
                className="rounded-[20px] border border-slate-200 bg-white p-5 space-y-3.5 shadow-xs"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs"
                      style={{ backgroundColor: catTheme.color }}
                    >
                      {catTheme.number}
                    </span>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 leading-tight">{ax.name}</h3>
                      <span className="text-[11px] font-semibold text-slate-500">
                        Nivel: <strong className="text-slate-800">{ax.level}</strong>
                      </span>
                    </div>
                  </div>
                  <span
                    className="text-xl font-mono font-black tabular-nums"
                    style={{ color: catTheme.colorText }}
                  >
                    {Math.round(ax.score)} <span className="text-xs font-normal text-slate-400">pts</span>
                  </span>
                </div>

                {/* Barra de progreso */}
                <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.max(5, ax.score))}%`,
                      backgroundColor: catTheme.color,
                    }}
                  />
                </div>

                {/* Pruebas */}
                {ax.testResults && ax.testResults.length > 0 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1.5">
                    {ax.testResults.map((tr) => (
                      <div key={tr.testId} className="flex items-center justify-between text-xs">
                        <span className="text-slate-600 truncate max-w-[200px]">
                          {tr.name}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold font-mono text-slate-800">
                            {tr.skipped ? 'Omitida (0 pts)' : `${tr.rawValue} ${tr.unit}`}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                              tr.zsmStatus === 'in_zsm' || tr.zsmStatus === 'above_zsm'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {tr.zsmStatus === 'in_zsm'
                              ? 'En ZSM'
                              : tr.zsmStatus === 'above_zsm'
                              ? 'Sobresaliente'
                              : 'Por debajo'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Llamada a la Acción si se hizo solo Exprés */}
      {isExpress && (
        <section className="rounded-3xl border border-indigo-200 bg-indigo-50/70 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-bold text-indigo-950">
              ¿Quieres descubrir tu perfil motor completo en los 6 ejes?
            </h3>
            <p className="text-xs text-indigo-900/80">
              Has completado el Reto Exprés de 3 pruebas. Da el siguiente paso con las 18 pruebas universales para desbloquear tu radar 360°.
            </p>
          </div>
          <Link
            href="/evaluar?mode=full"
            className="shrink-0 min-h-[46px] px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Hacer Chequeo Completo (18 pruebas)</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </section>
      )}

      {/* Pasaporte Familiar Imprimible (A4) */}
      <section className="pt-4 border-t border-slate-200 print:pt-0 print:border-none print:block">
        <FamilyPassportPrint
          participants={savedData.items.map((it) => ({
            alias: it.participant.alias,
            report: it.report,
          }))}
        />
      </section>

      {/* Acciones Finales */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-200 print:hidden">
        <Link
          href="/evaluar"
          className="min-h-[46px] px-5 py-2.5 rounded-2xl border border-slate-300 text-slate-700 text-xs sm:text-sm font-semibold hover:bg-slate-100 transition-colors flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          <span>Repetir o Nueva Evaluación</span>
        </Link>
        <Link
          href="/"
          className="min-h-[46px] px-5 py-2.5 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm font-bold hover:bg-slate-800 transition-colors"
        >
          <span>Ir a la Portada</span>
        </Link>
      </div>
    </main>
  );
}

export default function InformePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Cargando informe...</div>}>
      <InformeContent />
    </Suspense>
  );
}
