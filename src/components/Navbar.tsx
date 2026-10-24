'use client';

import React from 'react';
import {
  LayoutDashboard,
  Building2,
  Plus,
  Shield,
  BarChart3,
  UserCheck,
} from 'lucide-react';

interface NavbarProps {
  currentView: 'dashboard' | 'candidates' | 'kanban' | 'agents';
  onViewChange: (view: 'dashboard' | 'candidates' | 'kanban' | 'agents') => void;
  onOpenAddModal: () => void;
  userRole: 'ADMIN' | 'AGENT';
  onToggleRole: () => void;
}

export default function Navbar({
  currentView,
  onViewChange,
  onOpenAddModal,
  userRole,
  onToggleRole,
}: NavbarProps) {
  const isDeskActive = currentView === 'candidates' || currentView === 'kanban';

  return (
    <>
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-slate-200/90 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 sm:h-16 max-w-7xl items-center justify-between px-3 sm:px-6 lg:px-8">
          {/* Brand Logo */}
          <div className="flex items-center shrink-0">
            <button
              onClick={() => onViewChange('candidates')}
              className="flex items-center text-left cursor-pointer focus:outline-none"
            >
              <img
                src="/logo.png"
                alt="Sky Bridge Visa Consultancy"
                className="h-8 sm:h-9 w-auto max-w-[150px] sm:max-w-[190px] object-contain"
              />
            </button>
          </div>

          {/* Desktop Centered Segmented Navigation */}
          <nav className="hidden md:flex items-center gap-1 rounded-lg bg-slate-100/90 p-1 border border-slate-200/80 shadow-2xs">
            {/* Operations Desk */}
            <button
              onClick={() => onViewChange('candidates')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                isDeskActive
                  ? 'bg-[#213F7C] text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-[#213F7C] hover:bg-white/80'
              }`}
            >
              <LayoutDashboard className="h-3.5 w-3.5" />
              <span>Operations Desk</span>
            </button>

            {/* Executive Insights */}
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-[#213F7C] text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-[#213F7C] hover:bg-white/80'
              }`}
            >
              <BarChart3 className="h-3.5 w-3.5" />
              <span>Insights</span>
            </button>

            {/* Partner Agencies */}
            <button
              onClick={() => onViewChange('agents')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                currentView === 'agents'
                  ? 'bg-[#213F7C] text-white shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-[#213F7C] hover:bg-white/80'
              }`}
            >
              <Building2 className="h-3.5 w-3.5" />
              <span>Partner Agencies</span>
            </button>
          </nav>

          {/* Action Controls */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Role Switcher */}
            <button
              onClick={onToggleRole}
              title="Click to toggle between Admin & Restricted view"
              className={`flex items-center gap-1.5 rounded-lg border px-2 sm:px-2.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                userRole === 'ADMIN'
                  ? 'border-[#213F7C]/20 bg-[#213F7C]/6 text-[#213F7C] hover:bg-[#213F7C]/12'
                  : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {userRole === 'ADMIN' ? (
                <Shield className="h-3.5 w-3.5 text-[#213F7C]" />
              ) : (
                <UserCheck className="h-3.5 w-3.5 text-slate-600" />
              )}
              <span className="hidden sm:inline">
                {userRole === 'ADMIN' ? 'Head Office Admin' : 'Agent Portal'}
              </span>
            </button>

            {/* Add Candidate Button */}
            {userRole === 'ADMIN' && (
              <button
                onClick={onOpenAddModal}
                className="flex items-center gap-1.5 rounded-lg bg-[#C0434A] hover:bg-[#A8373E] active:scale-98 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5 stroke-[2.5]" />
                <span className="hidden xs:inline">Add Candidate</span>
                <span className="xs:hidden">Add</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sticky Bottom Navigation Bar (Optimized for thumb reach on mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md px-3 py-1.5 shadow-lg safe-bottom">
        <div className="grid grid-cols-3 gap-1 max-w-sm mx-auto">
          {/* Desk */}
          <button
            onClick={() => onViewChange('candidates')}
            className={`flex flex-col items-center justify-center py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
              isDeskActive
                ? 'text-[#213F7C] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1 rounded-md ${isDeskActive ? 'bg-[#213F7C]/10' : ''}`}>
              <LayoutDashboard className="h-4 w-4" />
            </div>
            <span className="mt-0.5">Desk</span>
          </button>

          {/* Insights */}
          <button
            onClick={() => onViewChange('dashboard')}
            className={`flex flex-col items-center justify-center py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
              currentView === 'dashboard'
                ? 'text-[#213F7C] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1 rounded-md ${currentView === 'dashboard' ? 'bg-[#213F7C]/10' : ''}`}>
              <BarChart3 className="h-4 w-4" />
            </div>
            <span className="mt-0.5">Insights</span>
          </button>

          {/* Agencies */}
          <button
            onClick={() => onViewChange('agents')}
            className={`flex flex-col items-center justify-center py-1 rounded-md text-[10px] font-semibold transition-colors cursor-pointer ${
              currentView === 'agents'
                ? 'text-[#213F7C] font-bold'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <div className={`p-1 rounded-md ${currentView === 'agents' ? 'bg-[#213F7C]/10' : ''}`}>
              <Building2 className="h-4 w-4" />
            </div>
            <span className="mt-0.5">Agencies</span>
          </button>
        </div>
      </nav>
    </>
  );
}
