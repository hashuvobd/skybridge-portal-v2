'use client';

import React, { useState } from 'react';
import {
  Send,
  CheckCircle2,
  X,
  MapPin,
} from 'lucide-react';

interface BatchActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  onBatchAction: (action: string, city?: string, date?: string) => Promise<void>;
}

const CITIES = ['Strumica', 'Tetovo', 'Skopje', 'Kumanovo', 'Shtip', 'Bitola'];

export default function BatchActionBar({
  selectedCount,
  onClearSelection,
  onBatchAction,
}: BatchActionBarProps) {
  const [selectedCity, setSelectedCity] = useState('Strumica');
  const [isProcessing, setIsProcessing] = useState(false);

  if (selectedCount === 0) return null;

  const handleAction = async (action: string) => {
    setIsProcessing(true);
    try {
      await onBatchAction(action, selectedCity);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-14 sm:bottom-6 left-1/2 z-40 -translate-x-1/2 w-full max-w-xl px-3 animate-in slide-in-from-bottom-3 duration-200">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3 rounded-xl border border-slate-300 bg-white/95 backdrop-blur-md p-2.5 sm:p-3 shadow-xl">
        {/* Selection Count */}
        <div className="flex items-center gap-2">
          <div className="flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-md bg-[#213F7C] text-white text-[11px] sm:text-xs font-bold font-mono-numeric">
            {selectedCount}
          </div>
          <span className="text-xs font-semibold text-slate-800">
            {selectedCount === 1 ? '1 selected' : `${selectedCount} selected`}
          </span>
          <button
            onClick={onClearSelection}
            className="text-[11px] text-slate-500 hover:text-slate-800 underline ml-1 cursor-pointer"
          >
            Clear
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {/* Mark Submission Slip */}
          <button
            onClick={() => handleAction('MARK_SUBMITTED')}
            disabled={isProcessing}
            className="flex items-center gap-1 rounded-lg border border-[#213F7C]/30 bg-[#213F7C]/8 px-2 sm:px-2.5 py-1.5 text-xs font-semibold text-[#213F7C] hover:bg-[#213F7C]/15 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Send className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-[#213F7C]" />
            <span>Mark Filed</span>
          </button>

          {/* City selector for batch approval */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-xs">
            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
            <select
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="bg-transparent text-slate-700 text-xs focus:outline-none cursor-pointer"
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Mark Approved */}
          <button
            onClick={() => handleAction('MARK_APPROVED')}
            disabled={isProcessing}
            className="flex items-center gap-1.5 rounded-lg bg-[#C0434A] hover:bg-[#A8373E] px-2.5 sm:px-3 py-1.5 text-xs font-bold text-white transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <CheckCircle2 className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
            <span>Approve</span>
          </button>

          {/* Dismiss */}
          <button
            onClick={onClearSelection}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
