'use client';

import { useState, useEffect } from 'react';

const STEPS = [
  { label: 'Fetching contract source code...', detail: 'Connecting to Etherscan V2 API' },
  { label: 'Analyzing bytecode structure...', detail: 'Disassembling EVM opcodes' },
  { label: 'Checking for reentrancy vulnerabilities...', detail: 'Pattern matching external calls' },
  { label: 'Scanning for arithmetic issues...', detail: 'Overflow/underflow detection' },
  { label: 'Analyzing flash loan vectors...', detail: 'Callback validation check' },
  { label: 'Checking proxy safety...', detail: 'EIP-1967 slot verification' },
  { label: 'Generating security report...', detail: 'Risk score calculation' },
];

export function AuditProgress({ isLoading, onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  useEffect(() => {
    if (!isLoading) {
      setCurrentStep(0);
      setCompletedSteps([]);
      return;
    }

    const timers = [];
    let delay = 400;

    for (let i = 0; i < STEPS.length; i++) {
      timers.push(setTimeout(() => {
        setCurrentStep(i);
        if (i > 0) {
          setCompletedSteps(prev => [...prev, i - 1]);
        }
      }, delay));
      delay += 600 + Math.random() * 400;
    }

    timers.push(setTimeout(() => {
      setCompletedSteps(prev => [...prev, STEPS.length - 1]);
      if (onComplete) onComplete();
    }, delay));

    return () => timers.forEach(clearTimeout);
  }, [isLoading, onComplete]);

  if (!isLoading) return null;

  return (
    <div className="card animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
        <div>
          <p className="text-white font-semibold text-sm">Analyzing Contract</p>
          <p className="text-gray-500 text-xs">Step {currentStep + 1} of {STEPS.length}</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1.5 bg-surface-3 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
          style={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
        />
      </div>

      {/* Steps */}
      <div className="space-y-2">
        {STEPS.map((step, i) => {
          const isCompleted = completedSteps.includes(i);
          const isCurrent = i === currentStep && !isCompleted;
          const isPending = i > currentStep && !isCompleted;

          return (
            <div key={i} className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all ${isCurrent ? 'bg-blue-500/5 border border-blue-500/10' : ''}`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 transition-all ${isCompleted ? 'bg-emerald-500' : isCurrent ? 'bg-blue-500' : 'bg-surface-3'}`}>
                {isCompleted ? (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                ) : isCurrent ? (
                  <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                ) : (
                  <div className="w-1.5 h-1.5 bg-gray-600 rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${isCompleted ? 'text-gray-500 line-through' : isCurrent ? 'text-white' : 'text-gray-600'}`}>{step.label}</p>
                {isCurrent && <p className="text-[10px] text-gray-500 mt-0.5">{step.detail}</p>}
              </div>
              {isCompleted && <span className="text-[10px] text-emerald-400 font-medium">Done</span>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
