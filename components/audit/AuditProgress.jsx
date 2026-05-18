'use client';

import { useState, useEffect, useRef } from 'react';

const STEPS = [
  { label: 'Validating address', detail: 'Format and checksum verification' },
  { label: 'Fetching contract metadata', detail: 'Retrieving ABI and deployment info' },
  { label: 'Checking verified source code', detail: 'Querying block explorer for source' },
  { label: 'Running static analysis', detail: 'Vulnerability pattern matching' },
  { label: 'Running bytecode analysis', detail: 'EVM opcode disassembly and scanning' },
  { label: 'Checking proxy/admin risk', detail: 'Storage slot and ownership analysis' },
  { label: 'Generating final report', detail: 'Risk score calculation and aggregation' },
];

export function AuditProgress({ isLoading, scanLog = [], stepStatuses = [], onRetry, onUseDemo, onBytecodeOnly }) {
  const [currentStep, setCurrentStep] = useState(0);
  const logRef = useRef(null);

  // Auto-scroll log panel
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [scanLog]);

  // Progress through steps when loading
  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      return;
    }

    const timers = [];
    let delay = 300;

    for (let i = 0; i < STEPS.length; i++) {
      timers.push(setTimeout(() => {
        setCurrentStep(i);
      }, delay));
      delay += 500 + 200;
    }

    return () => timers.forEach(clearTimeout);
  }, [isLoading]);

  const getStepStatus = (index) => {
    if (stepStatuses[index]) return stepStatuses[index];
    if (isLoading) {
      if (index < currentStep) return 'complete';
      if (index === currentStep) return 'active';
      return 'pending';
    }
    return 'pending';
  };

  const hasError = stepStatuses.some(s => s === 'error');

  if (!isLoading && scanLog.length === 0 && !hasError) return null;

  const getStepIcon = (index) => {
    const status = getStepStatus(index);
    switch (status) {
      case 'complete':
        return (
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'active':
        return (
          <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center shrink-0">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
          </div>
        );
      case 'error':
        return (
          <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shrink-0">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return <div className="w-5 h-5 rounded-full bg-surface-3 flex items-center justify-center shrink-0"><div className="w-1.5 h-1.5 bg-gray-600 rounded-full" /></div>;
    }
  };

  // Count completed steps for progress bar
  const completedCount = STEPS.filter((_, i) => getStepStatus(i) === 'complete').length;
  const progressPct = isLoading ? ((currentStep + 1) / STEPS.length) * 100 : hasError ? (completedCount / STEPS.length) * 100 : 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Progress Card */}
      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          {isLoading ? (
            <div className="w-8 h-8 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          ) : hasError ? (
            <div className="w-8 h-8 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          <div>
            <p className="text-white font-semibold text-sm">
              {hasError ? 'Scan Error' : isLoading ? 'Analyzing Contract' : 'Scan Complete'}
            </p>
            <p className="text-gray-500 text-xs">
              {isLoading ? `Step ${currentStep + 1} of ${STEPS.length}` : hasError ? `Failed at step ${stepStatuses.indexOf('error') + 1}` : `${completedCount} steps completed`}
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 bg-surface-3 rounded-full mb-6 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${hasError ? 'bg-gradient-to-r from-red-500 to-red-400' : 'bg-gradient-to-r from-indigo-500 to-indigo-400'}`}
            style={{ width: `${progressPct}%` }}
          />
        </div>

        {/* Steps */}
        <div className="space-y-1">
          {STEPS.map((step, i) => {
            const status = getStepStatus(i);
            return (
              <div key={i} className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all ${status === 'active' ? 'bg-indigo-500/5 border border-indigo-500/10' : status === 'error' ? 'bg-red-500/5 border border-red-500/10' : ''}`}>
                {getStepIcon(i)}
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${status === 'complete' ? 'text-gray-500 line-through' : status === 'active' ? 'text-white' : status === 'error' ? 'text-red-400' : 'text-gray-600'}`}>
                    {step.label}
                  </p>
                  {status === 'active' && <p className="text-[10px] text-gray-500 mt-0.5">{step.detail}</p>}
                  {status === 'error' && <p className="text-[10px] text-red-400/70 mt-0.5">Failed — see scan log</p>}
                </div>
                {status === 'complete' && <span className="text-[10px] text-emerald-400 font-medium">Done</span>}
                {status === 'error' && <span className="text-[10px] text-red-400 font-medium">Error</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Scan Log */}
      {scanLog.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-600/10">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Scan Log</h3>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">{scanLog.length} entries</span>
          </div>
          <div ref={logRef} className="max-h-48 overflow-y-auto font-mono text-xs p-4 space-y-1" style={{ background: 'var(--surface-0, #050507)' }}>
            {scanLog.map((entry, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className={`shrink-0 font-bold ${
                  entry.level === 'ok' ? 'text-emerald-400' :
                  entry.level === 'warn' ? 'text-yellow-400' :
                  entry.level === 'high' ? 'text-orange-400' :
                  entry.level === 'error' ? 'text-red-400' :
                  'text-gray-500'
                }`}>
                  [{entry.level?.toUpperCase() || 'INFO'}]
                </span>
                <span className="text-gray-300">{entry.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Actions */}
      {hasError && !isLoading && (
        <div className="card border-red-500/20">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center justify-center shrink-0">
              <svg className="w-5 h-5 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Scan Failed</h3>
              <p className="text-gray-400 text-xs mt-1">
                The analysis could not complete. This may be due to network issues, an unverified contract, or API limits.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {onRetry && (
              <button onClick={onRetry} className="btn-primary btn-sm flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Retry Scan
              </button>
            )}
            {onUseDemo && (
              <button onClick={onUseDemo} className="btn-secondary btn-sm flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Use Demo Data
              </button>
            )}
            {onBytecodeOnly && (
              <button onClick={onBytecodeOnly} className="btn-secondary btn-sm flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                Bytecode-Only
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
