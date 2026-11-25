'use client';

import React, { Suspense, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  Download,
  GraduationCap,
  Lock,
  Plus,
  Table,
  Timer,
  Trash2,
} from 'lucide-react';
import { ALL_AXIS_IDS, ALL_TEST_IDS, AXES_CONFIG, EXPRESS_TEST_IDS, TESTS_CATALOG } from '../../data/tests-catalog';
import { Sex, TestId } from '../../types/radar-motor';
import { calculateTestScore, evaluateFullReport } from '../../lib/scoring-engine';
import {
  ClassroomSession,
  ClassroomStudent,
  clearClassroomSession,
  exportClassroomCSV,
  saveClassroomSession,
  useClassroomSession,
} from '../../lib/session-store';
import { TestExecutionPanel } from '../../components/timers/TestExecutionPanel';

const initialClassroomSession: ClassroomSession = {
  groupLabel: '2º Primaria A',
  defaultAge: 7,
  testMode: 'express',
  students: [
    { id: 's1', alias: 'Alumno #01', age: 7, sex: 'M', inputs: {} },
    { id: 's2', alias: 'Alumno #02', age: 7, sex: 'F', inputs: {} },
    { id: 's3', alias: 'Alumno #03', age: 7, sex: 'M', inputs: {} },
    { id: 's4', alias: 'Alumno #04', age: 7, sex: 'F', inputs: {} },
    { id: 's5', alias: 'Alumno #05', age: 7, sex: 'M', inputs: {} },
  ],
  updatedAt: '',
};

function AulaContent() {
  const savedSession = useClassroomSession();
  const [localSession, setLocalSession] = useState<ClassroomSession | null>(null);

  const session = localSession ?? (savedSession && savedSession.students.length > 0 ? savedSession : initialClassroomSession);

  const [activeTab, setActiveTab] = useState<'register' | 'summary'>('register');
  const [selectedTestId, setSelectedTestId] = useState<TestId>('sit_to_stand_5x');
  const [isTimerModalOpen, setIsTimerModalOpen] = useState(false);

  // Guardar ante cualquier cambio
  const updateSession = (newSession: ClassroomSession) => {
    const updated = { ...newSession, updatedAt: new Date().toISOString() };
    setLocalSession(updated);
    saveClassroomSession(updated);
  };

  const handleClearSession = () => {
    if (confirm('¿Seguro que deseas borrar todos los datos del aula de este dispositivo? Esta acción es irreversible (se borran de este dispositivo).')) {
      clearClassroomSession();
      setLocalSession({
        groupLabel: 'Nuevo Grupo',
        defaultAge: 10,
        testMode: 'express',
        students: [],
        updatedAt: new Date().toISOString(),
      });
    }
  };

  // Añadir un alumno
  const handleAddStudent = () => {
    const nextNum = session.students.length + 1;
    const newStudent: ClassroomStudent = {
      id: `s_${Date.now()}_${nextNum}`,
      alias: `Alumno #${String(nextNum).padStart(2, '0')}`,
      age: session.defaultAge,
      sex: 'N',
      inputs: {},
    };
    updateSession({
      ...session,
      students: [...session.students, newStudent],
    });
  };

  // Generar bloque de alumnos (ej. 10 o 20)
  const handleGenerateBatch = (count: number) => {
    const currentLen = session.students.length;
    const newBatch: ClassroomStudent[] = Array.from({ length: count }, (_, i) => {
      const num = currentLen + i + 1;
      return {
        id: `s_${Date.now()}_${num}`,
        alias: `Alumno #${String(num).padStart(2, '0')}`,
        age: session.defaultAge,
        sex: num % 2 === 0 ? 'F' : 'M',
        inputs: {},
      };
    });
    updateSession({
      ...session,
      students: [...session.students, ...newBatch],
    });
  };

  // Actualizar marca de un alumno en la prueba actual
  const handleUpdateStudentInput = (studentId: string, value: number | null) => {
    const updatedStudents = session.students.map((st) => {
      if (st.id === studentId) {
        const nextInputs = { ...st.inputs, [selectedTestId]: value };
        // Recalcular informe del alumno
        const report = evaluateFullReport(st.age, st.sex, nextInputs, session.testMode);
        return { ...st, inputs: nextInputs, report };
      }
      return st;
    });

    updateSession({
      ...session,
      students: updatedStudents,
    });
  };

  const availableTests = session.testMode === 'express' ? EXPRESS_TEST_IDS : ALL_TEST_IDS;
  const currentTestDef = TESTS_CATALOG[selectedTestId];

  // Cálculo de resumen de cohorte
  const studentsWithReports = session.students.map((st) => {
    if (!st.report) {
      return {
        ...st,
        report: evaluateFullReport(st.age, st.sex, st.inputs, session.testMode),
      };
    }
    return st;
  });

  const totalStudents = studentsWithReports.length;

  // Estadísticas por Eje
  const axisStats = ALL_AXIS_IDS.map((axisId) => {
    const axisCfg = AXES_CONFIG[axisId];
    let sumScore = 0;
    let inZsmCount = 0;
    let evaluatedCount = 0;

    studentsWithReports.forEach((st) => {
      const axResult = st.report?.axisResults[axisId];
      if (axResult && axResult.score > 0) {
        sumScore += axResult.score;
        evaluatedCount++;
        // Ver si sus pruebas en este eje están en ZSM
        const inZsm = axResult.testResults.some((tr) => tr.zsmStatus === 'in_zsm' || tr.zsmStatus === 'above_zsm');
        if (inZsm) inZsmCount++;
      }
    });

    const avgScore = evaluatedCount > 0 ? Math.round((sumScore / evaluatedCount) * 10) / 10 : 0;
    const zsmPercent = evaluatedCount > 0 ? Math.round((inZsmCount / evaluatedCount) * 100) : 0;

    return {
      axisId,
      name: axisCfg.name,
      shortName: axisCfg.shortName,
      avgScore,
      zsmPercent,
      evaluatedCount,
    };
  });

  return (
    <div className="flex-1 max-w-5xl w-full mx-auto px-4 py-8 space-y-8">
      {/* Barra de Navegación Superior */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver al inicio</span>
        </Link>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 flex items-center gap-1.5">
            <Lock className="h-3 w-3" />
            <span>Datos guardados en este dispositivo</span>
          </span>
          <button
            type="button"
            onClick={handleClearSession}
            className="text-xs font-semibold px-3 py-1.5 rounded-xl border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors flex items-center gap-1"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Borrar sesión del aula</span>
          </button>
        </div>
      </div>

      {/* Encabezado Principal */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300">
          <GraduationCap className="h-4 w-4" />
          <span>Módulo Docente de Educación Física</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
          Modo Aula: Evaluación Grupal Anónima
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
          Diseñado para el profesorado de Educación Física. Registra las marcas de tu clase usando únicamente <strong>números de lista o alias</strong>. Cero almacenamiento en la nube, descarga instantánea en CSV y cálculo automático de la Zona de Salud Motriz (ZSM).
        </p>
      </div>

      {/* Panel de Configuración de Grupo */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 sm:p-6 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Nombre del Grupo / Clase
            </label>
            <input
              type="text"
              value={session.groupLabel}
              onChange={(e) => updateSession({ ...session, groupLabel: e.target.value })}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
              placeholder="Ej: 2º Primaria B"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Edad habitual del grupo
            </label>
            <input
              type="number"
              min={6}
              max={18}
              value={session.defaultAge}
              onChange={(e) => {
                const age = Number(e.target.value);
                updateSession({ ...session, defaultAge: age });
              }}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm tabular-nums"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 block mb-1">
              Batería de Pruebas
            </label>
            <select
              value={session.testMode}
              onChange={(e) => {
                const mode = e.target.value as 'express' | 'full';
                const nextTest = mode === 'express' ? 'sit_to_stand_5x' : selectedTestId;
                updateSession({ ...session, testMode: mode });
                setSelectedTestId(nextTest);
              }}
              className="w-full min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
            >
              <option value="express">Batería Exprés (3 pruebas cardinales)</option>
              <option value="full">Batería Completa (18 pruebas)</option>
            </select>
          </div>
        </div>

        {/* Acciones de gestión rápida de alumnos */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleAddStudent}
              className="min-h-[40px] px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-100 dark:text-slate-900 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Plus className="h-4 w-4" />
              <span>Añadir alumno</span>
            </button>
            <button
              type="button"
              onClick={() => handleGenerateBatch(5)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              +5 Alumnos
            </button>
            <button
              type="button"
              onClick={() => handleGenerateBatch(10)}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              +10 Alumnos
            </button>
          </div>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Total en lista: {totalStudents} alumnos
          </span>
        </div>
      </div>

      {/* Selector de Pestañas de Trabajo */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('register')}
          className={`min-h-[44px] px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'register'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Timer className="h-4 w-4" />
          <span>1. Registro de Pruebas</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('summary')}
          className={`min-h-[44px] px-5 py-2.5 rounded-2xl font-bold text-sm transition-all flex items-center gap-2 ${
            activeTab === 'summary'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Table className="h-4 w-4" />
          <span>2. Resumen de Clase (Intra-Cohorte)</span>
        </button>
      </div>

      {/* =========================================================================
          PESTAÑA 1: REGISTRO DE PRUEBAS
      ========================================================================= */}
      {activeTab === 'register' && (
        <section className="space-y-6 animate-in fade-in duration-150">
          {/* Selector de Prueba Activa */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex-1">
              <label className="text-[11px] font-bold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                Prueba a registrar en la sesión:
              </label>
              <select
                value={selectedTestId}
                onChange={(e) => setSelectedTestId(e.target.value as TestId)}
                className="w-full sm:w-auto min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-sm"
              >
                {availableTests.map((tId) => {
                  const t = TESTS_CATALOG[tId];
                  return (
                    <option key={tId} value={tId}>
                      {t.order}. {t.name} ({t.unit})
                    </option>
                  );
                })}
              </select>
            </div>
            <button
              type="button"
              onClick={() => setIsTimerModalOpen(true)}
              className="shrink-0 min-h-[42px] px-4 py-2 rounded-xl bg-sky-100 hover:bg-sky-200 dark:bg-sky-950 dark:hover:bg-sky-900 text-sky-800 dark:text-sky-300 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Timer className="h-4 w-4" />
              <span>Abrir temporizador / guía visual</span>
            </button>
          </div>

          {/* Tabla ágil de registro alumno por alumno */}
          <div className="overflow-x-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-[11px] uppercase font-bold text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="py-3 px-4">Nº / Alias</th>
                  <th className="py-3 px-3">Edad</th>
                  <th className="py-3 px-3">Sexo</th>
                  <th className="py-3 px-4">Marca ({currentTestDef.unit})</th>
                  <th className="py-3 px-4">Estado ZSM</th>
                  <th className="py-3 px-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {session.students.map((st, idx) => {
                  const currentVal = st.inputs[selectedTestId];
                  const testRes = calculateTestScore(selectedTestId, currentVal ?? null, st.age, st.sex);

                  return (
                    <tr key={st.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                        <input
                          type="text"
                          value={st.alias}
                          onChange={(e) => {
                            const updated = session.students.map((s, i) =>
                              i === idx ? { ...s, alias: e.target.value } : s
                            );
                            updateSession({ ...session, students: updated });
                          }}
                          className="w-28 px-2 py-1 rounded-lg border border-transparent hover:border-slate-300 dark:hover:border-slate-700 bg-transparent font-bold text-xs sm:text-sm"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min={6}
                          max={18}
                          value={st.age}
                          onChange={(e) => {
                            const updated = session.students.map((s, i) =>
                              i === idx ? { ...s, age: Number(e.target.value) } : s
                            );
                            updateSession({ ...session, students: updated });
                          }}
                          className="w-14 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs tabular-nums"
                        />
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={st.sex}
                          onChange={(e) => {
                            const updated = session.students.map((s, i) =>
                              i === idx ? { ...s, sex: e.target.value as Sex } : s
                            );
                            updateSession({ ...session, students: updated });
                          }}
                          className="px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs"
                        >
                          <option value="M">M</option>
                          <option value="F">F</option>
                          <option value="N">N</option>
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step={0.1}
                            placeholder="Sin marca"
                            value={currentVal !== undefined && currentVal !== null ? currentVal : ''}
                            onChange={(e) => {
                              const val = e.target.value === '' ? null : Number(e.target.value);
                              handleUpdateStudentInput(st.id, val);
                            }}
                            className="w-28 px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-sm tabular-nums focus:ring-2 focus:ring-sky-500"
                          />
                          <span className="text-xs text-slate-500">{currentTestDef.unit}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {currentVal !== undefined && currentVal !== null ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              testRes.zsmStatus === 'in_zsm'
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : testRes.zsmStatus === 'above_zsm'
                                ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                                : 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300'
                            }`}
                          >
                            {testRes.zsmStatus === 'in_zsm'
                              ? 'En ZSM'
                              : testRes.zsmStatus === 'above_zsm'
                              ? 'Por encima ZSM'
                              : 'Por debajo ZSM'}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">Pendiente</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            const updated = session.students.filter((_, i) => i !== idx);
                            updateSession({ ...session, students: updated });
                          }}
                          className="text-slate-400 hover:text-red-500 p-1 transition-colors"
                          aria-label="Eliminar alumno"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* =========================================================================
          PESTAÑA 2: RESUMEN DE CLASE (INTRA-COHORTE Y ZSM)
      ========================================================================= */}
      {activeTab === 'summary' && (
        <section className="space-y-6 animate-in fade-in duration-150">
          {/* Tarjeta de descarga de CSV */}
          <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Exportación de Datos para el Cuaderno del Docente
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Descarga una hoja de cálculo limpia (.csv) con puntuaciones globales y por eje de toda la clase.
              </p>
            </div>
            <button
              type="button"
              onClick={() => exportClassroomCSV(session)}
              className="shrink-0 min-h-[48px] px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-sm flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              <span>Exportar CSV Anónimo</span>
            </button>
          </div>

          {/* Estadísticas de la Cohorte por Ejes */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Porcentaje de la Clase en Zona de Salud Motriz (% ZSM):
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {axisStats.map((ax) => (
                <div
                  key={ax.axisId}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-3 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {ax.shortName}
                    </span>
                    <span className="text-sm font-black text-slate-900 dark:text-white">
                      {ax.avgScore} pts
                    </span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500">
                      <span>Alumnos en ZSM:</span>
                      <span className="font-bold text-emerald-600">{ax.zsmPercent}%</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${ax.zsmPercent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Modal de Temporizador y Panel Visual */}
      {isTimerModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="relative w-full max-w-3xl overflow-hidden rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-6 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                Temporizador y Demostración: {currentTestDef.name}
              </h3>
              <button
                type="button"
                onClick={() => setIsTimerModalOpen(false)}
                className="text-xs font-bold px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"
              >
                Cerrar
              </button>
            </div>
            <TestExecutionPanel initialTestId={selectedTestId} />
          </div>
        </div>
      )}
    </div>
  );
}

export default function AulaPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-slate-500">Cargando Modo Aula...</div>}>
      <AulaContent />
    </Suspense>
  );
}
