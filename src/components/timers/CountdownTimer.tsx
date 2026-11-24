'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  Check,
  Minus,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { audioSynth } from '../../lib/audio-synth';

interface CountdownTimerProps {
  durationSeconds: number;
  testName: string;
  unit: string;
  onFinish: (finalValue: number) => void;
  onCancel?: () => void;
}

export function CountdownTimer({
  durationSeconds,
  testName,
  unit,
  onFinish,
  onCancel,
}: CountdownTimerProps) {
  // Estados: 'idle' | 'prep' | 'running' | 'paused' | 'finished'
  const [status, setStatus] = useState<'idle' | 'prep' | 'running' | 'paused' | 'finished'>('idle');
  const [prepCount, setPrepCount] = useState(3);
  const [timeLeft, setTimeLeft] = useState(durationSeconds);
  const [counter, setCounter] = useState(0);
  const [isMuted, setIsMuted] = useState(audioSynth.getMuted());

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const halfwayNotifiedRef = useRef(false);

  // Toggle de sonido
  const handleToggleMute = () => {
    const nextMuted = audioSynth.toggleMute();
    setIsMuted(nextMuted);
  };

  // Cuenta atrás de preparación 3, 2, 1
  useEffect(() => {
    if (status !== 'prep') return;

    if (prepCount > 0) {
      audioSynth.playPrepBeep();
      const timer = setTimeout(() => {
        setPrepCount((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      audioSynth.playStartBeep();
      setStatus('running');
    }
  }, [status, prepCount]);

  // Cronómetro regresivo de la prueba
  useEffect(() => {
    if (status !== 'running') return;

    const halfway = Math.floor(durationSeconds / 2);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        const nextTime = prev - 1;

        if (nextTime === halfway && !halfwayNotifiedRef.current) {
          audioSynth.playHalfwayBeep();
          halfwayNotifiedRef.current = true;
        }

        if (nextTime <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          audioSynth.playFinishBeep();
          setStatus('finished');
          return 0;
        }
        return nextTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [status, durationSeconds]);

  const handleStart = () => {
    setPrepCount(3);
    halfwayNotifiedRef.current = false;
    setStatus('prep');
  };

  const handlePause = () => {
    setStatus('paused');
  };

  const handleResume = () => {
    setStatus('running');
  };

  const handleReset = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setStatus('idle');
    setTimeLeft(durationSeconds);
    setCounter(0);
    setPrepCount(3);
    halfwayNotifiedRef.current = false;
  };

  const handleTap = () => {
    audioSynth.playTapClick();
    setCounter((prev) => prev + 1);
  };

  const handleManualIncrement = (amount: number) => {
    setCounter((prev) => Math.max(0, prev + amount));
  };

  // Porcentaje de progreso
  const progressPercent = Math.max(0, Math.min(100, ((durationSeconds - timeLeft) / durationSeconds) * 100));

  return (
    <div className="w-full max-w-lg mx-auto rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg p-6 sm:p-8 space-y-6">
      {/* Cabecera del temporizador */}
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
            Temporizador con Cuenta Atrás
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

      {/* Pantalla central del tiempo */}
      <div className="relative flex flex-col items-center justify-center py-6 rounded-3xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800 overflow-hidden">
        {/* Barra de progreso superior */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full bg-gradient-to-r from-sky-500 to-indigo-600 transition-all duration-1000 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {status === 'prep' ? (
          <div className="flex flex-col items-center justify-center py-4 animate-in zoom-in-75 duration-200">
            <span className="text-xs font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400 mb-1">
              ¡Prepárate!
            </span>
            <span className="text-7xl sm:text-8xl font-black text-amber-600 dark:text-amber-400 tabular-nums">
              {prepCount}
            </span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1">
              Tiempo Restante
            </span>
            <span className="text-6xl sm:text-7xl font-mono font-black text-slate-900 dark:text-white tabular-nums tracking-tight">
              {String(Math.floor(timeLeft / 60)).padStart(2, '0')}:{String(timeLeft % 60).padStart(2, '0')}
            </span>
            {timeLeft <= durationSeconds / 2 && timeLeft > 0 && (
              <span className="mt-2 text-xs font-bold text-indigo-600 dark:text-indigo-400 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 animate-pulse">
                ¡Superado el ecuador de la prueba!
              </span>
            )}
            {status === 'finished' && (
              <span className="mt-2 text-xs font-bold text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80">
                ¡Tiempo cumplido!
              </span>
            )}
          </div>
        )}
      </div>

      {/* Contador Táctil de Repeticiones */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
            Repeticiones ({unit})
          </span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleManualIncrement(-1)}
              disabled={counter <= 0}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 disabled:opacity-30"
              aria-label="Restar una repetición"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="font-mono font-black text-xl text-slate-900 dark:text-white min-w-[36px] text-center tabular-nums">
              {counter}
            </span>
            <button
              type="button"
              onClick={() => handleManualIncrement(1)}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200"
              aria-label="Sumar una repetición"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Botón Gigante +1 (Ergonomía Senior: mínimo 64px de altura) */}
        <button
          type="button"
          onClick={handleTap}
          disabled={status !== 'running' && status !== 'finished'}
          className="w-full min-h-[64px] sm:min-h-[72px] px-6 py-4 rounded-3xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none text-white font-black text-2xl sm:text-3xl transition-all shadow-md flex items-center justify-center gap-3 focus:outline-none focus:ring-4 focus:ring-sky-300"
        >
          <Plus className="h-8 w-8 stroke-[3]" />
          <span>¡CONTAR (+1)!</span>
        </button>
      </div>

      {/* Controles de Estado (Iniciar, Pausar, Reiniciar, Guardar) */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-3">
        {status === 'idle' && (
          <button
            type="button"
            onClick={handleStart}
            className="flex-1 min-h-[52px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>Iniciar Cuenta Atrás (3s)</span>
          </button>
        )}

        {status === 'running' && (
          <button
            type="button"
            onClick={handlePause}
            className="flex-1 min-h-[52px] px-6 py-3 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Pause className="h-5 w-5 fill-current" />
            <span>Pausar</span>
          </button>
        )}

        {status === 'paused' && (
          <button
            type="button"
            onClick={handleResume}
            className="flex-1 min-h-[52px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Play className="h-5 w-5 fill-current" />
            <span>Reanudar</span>
          </button>
        )}

        {status === 'finished' && (
          <button
            type="button"
            onClick={() => onFinish(counter)}
            className="flex-1 min-h-[52px] px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-md"
          >
            <Check className="h-5 w-5 stroke-[3]" />
            <span>Guardar {counter} {unit}</span>
          </button>
        )}

        {status !== 'idle' && status !== 'prep' && (
          <button
            type="button"
            onClick={handleReset}
            className="min-h-[52px] px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reiniciar</span>
          </button>
        )}

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[52px] px-4 py-3 rounded-2xl text-slate-500 hover:text-slate-700 dark:text-slate-400 text-xs font-semibold"
          >
            Omitir prueba
          </button>
        )}
      </div>
    </div>
  );
}
