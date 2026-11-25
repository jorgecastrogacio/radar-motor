'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Flag,
  Minus,
  Play,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { audioSynth } from '../../lib/audio-synth';

interface StopwatchTimerProps {
  testName: string;
  maxSeconds?: number;
  direction: 'higher_is_better' | 'lower_is_better';
  onFinish: (finalSeconds: number) => void;
  onCancel?: () => void;
}

export function StopwatchTimer({
  testName,
  maxSeconds,
  direction,
  onFinish,
  onCancel,
}: StopwatchTimerProps) {
  const [status, setStatus] = useState<'idle' | 'prep' | 'running' | 'stopped'>('idle');
  const [prepCount, setPrepCount] = useState(3);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isMuted, setIsMuted] = useState(audioSynth.getMuted());

  const startTimeRef = useRef<number>(0);
  const animFrameRef = useRef<number | null>(null);

  const handleToggleMute = () => {
    const nextMuted = audioSynth.toggleMute();
    setIsMuted(nextMuted);
  };

  // Cuenta atrás de preparación 3, 2, 1
  useEffect(() => {
    if (status !== 'prep') return;

    if (prepCount > 1) {
      audioSynth.playPrepBeep();
      const timer = setTimeout(() => {
        setPrepCount((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (prepCount === 1) {
      audioSynth.playPrepBeep();
      const timer = setTimeout(() => {
        audioSynth.playStartBeep();
        startTimeRef.current = performance.now();
        setPrepCount(0);
        setStatus('running');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [status, prepCount]);

  // Cronómetro con requestAnimationFrame para suavidad y precisión
  useEffect(() => {
    if (status !== 'running') return;

    const updateTimer = () => {
      const current = performance.now();
      const elapsed = current - startTimeRef.current;

      if (maxSeconds && elapsed >= maxSeconds * 1000) {
        setElapsedMs(maxSeconds * 1000);
        audioSynth.playFinishBeep();
        setStatus('stopped');
        return;
      }

      setElapsedMs(elapsed);
      animFrameRef.current = requestAnimationFrame(updateTimer);
    };

    animFrameRef.current = requestAnimationFrame(updateTimer);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [status, maxSeconds]);

  const handleStart = () => {
    setPrepCount(3);
    setElapsedMs(0);
    setStatus('prep');
  };

  const handleStop = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    audioSynth.playFinishBeep();
    setStatus('stopped');
  };

  const handleReset = () => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    setStatus('idle');
    setElapsedMs(0);
    setPrepCount(3);
  };

  const handleAdjustSeconds = (deltaSeconds: number) => {
    setElapsedMs((prev) => {
      const nextMs = Math.max(0, prev + deltaSeconds * 1000);
      if (maxSeconds && nextMs > maxSeconds * 1000) return maxSeconds * 1000;
      return nextMs;
    });
  };

  const currentSeconds = Math.round((elapsedMs / 1000) * 10) / 10;
  const minutes = Math.floor(elapsedMs / 60000);
  const seconds = Math.floor((elapsedMs % 60000) / 1000);
  const tenths = Math.floor((elapsedMs % 1000) / 100);

  return (
    <div className="w-full max-w-lg mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-6 sm:p-8 space-y-6">
      {/* Cabecera */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Cronómetro de Precisión
          </span>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight">
            {testName}
          </h3>
        </div>
        <button
          type="button"
          onClick={handleToggleMute}
          aria-label={isMuted ? 'Activar sonido' : 'Silenciar sonido'}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {isMuted ? <VolumeX className="h-5 w-5 text-red-500" /> : <Volume2 className="h-5 w-5 text-emerald-600" />}
        </button>
      </div>

      {/* Pantalla central del cronómetro */}
      <div className="flex flex-col items-center justify-center py-8 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800">
        {status === 'prep' ? (
          <div className="flex flex-col items-center justify-center animate-in zoom-in-75 duration-200">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
              ¡Listos!
            </span>
            <span className="text-7xl sm:text-8xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {prepCount}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
              Tiempo Transcurrido
            </span>
            <div className="text-6xl sm:text-7xl font-mono font-black text-slate-900 dark:text-white tabular-nums tracking-tight flex items-baseline">
              <span>{String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}</span>
              <span className="text-4xl sm:text-5xl text-sky-600 dark:text-sky-400">.{tenths}</span>
            </div>
            {maxSeconds && (
              <span className="mt-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
                Límite máximo de la prueba: {maxSeconds} segundos
              </span>
            )}
            {direction === 'lower_is_better' && (
              <span className="mt-1 text-[11px] font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full">
                ¡Menor tiempo significa mejor rendimiento!
              </span>
            )}
          </div>
        )}
      </div>

      {/* Botón Principal Gigante (Mínimo 64px de altura) */}
      <div className="space-y-3">
        {status === 'running' ? (
          <button
            type="button"
            onClick={handleStop}
            className="w-full min-h-[64px] sm:min-h-[72px] px-6 py-4 rounded-3xl bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-black text-2xl sm:text-3xl transition-all shadow-md flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-red-300"
          >
            <Flag className="h-8 w-8 fill-current" />
            <span>¡PARAR (FIN)!</span>
          </button>
        ) : status === 'idle' ? (
          <button
            type="button"
            onClick={handleStart}
            className="w-full min-h-[64px] sm:min-h-[72px] px-6 py-4 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 active:scale-[0.98] text-white font-black text-2xl sm:text-3xl transition-all shadow-md flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          >
            <Play className="h-8 w-8 fill-current" />
            <span>COMENZAR (3s)</span>
          </button>
        ) : status === 'stopped' ? (
          <button
            type="button"
            onClick={() => onFinish(currentSeconds)}
            className="w-full min-h-[64px] sm:min-h-[72px] px-6 py-4 rounded-3xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-black text-xl sm:text-2xl transition-all shadow-md flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-emerald-300"
          >
            <Check className="h-8 w-8 stroke-[3]" />
            <span>GUARDAR: {currentSeconds} s</span>
          </button>
        ) : null}
      </div>

      {/* Ajuste manual fino de segundos si se usó reloj de pulsera o pared */}
      {status === 'stopped' && (
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 block text-center">
            ¿Quieres ajustar el tiempo final manualmente?
          </span>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => handleAdjustSeconds(-1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <Minus className="h-3.5 w-3.5" /> 1s
            </button>
            <span className="font-mono font-black text-base text-slate-900 dark:text-white">
              {currentSeconds} s
            </span>
            <button
              type="button"
              onClick={() => handleAdjustSeconds(1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 text-xs font-bold text-slate-700 dark:text-slate-200"
            >
              <Plus className="h-3.5 w-3.5" /> 1s
            </button>
          </div>
        </div>
      )}

      {/* Controles secundarios */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        {status !== 'idle' && (
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Repetir intento</span>
          </button>
        )}

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[44px] px-4 py-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-semibold ml-auto"
          >
            Omitir prueba
          </button>
        )}
      </div>
    </div>
  );
}
