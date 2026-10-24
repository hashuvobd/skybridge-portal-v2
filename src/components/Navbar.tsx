'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  Building2,
  Plus,
  Shield,
  BarChart3,
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
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white shadow-xs">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <div className="flex items-center shrink-0 z-10">
          <div
            className="flex items-center cursor-pointer select-none"
            onClick={() => onViewChange('candidates')}
          >
            <img
              src="/logo.png"
              alt="Sky Bridge Visa Consultancy"
              className="h-9 sm:h-10 w-auto max-w-[180px] sm:max-w-[200px] object-contain"
            />
          </div>
        </div>

        {/* Centered Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1.5 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {/* Operations Desk */}
          <button
            onClick={() => onViewChange('candidates')}
            className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'candidates' || currentView === 'kanban'
                ? 'bg-[#213F7C] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-[#213F7C] hover:bg-slate-50'
            }`}
          >
            <LayoutDashboard className={`h-4 w-4 ${currentView === 'candidates' || currentView === 'kanban' ? 'text-white' : 'text-slate-500'}`} />
            <span>Operations Desk</span>
          </button>

          {/* Executive Insights */}
          <button
            onClick={() => onViewChange('dashboard')}
            className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'dashboard'
                ? 'bg-[#213F7C] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-[#213F7C] hover:bg-slate-50'
            }`}
          >
            <BarChart3 className={`h-4 w-4 ${currentView === 'dashboard' ? 'text-white' : 'text-slate-500'}`} />
            <span>Executive Insights</span>
          </button>

          {/* Partner Agencies */}
          <button
            onClick={() => onViewChange('agents')}
            className={`flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-semibold transition-all cursor-pointer ${
              currentView === 'agents'
                ? 'bg-[#213F7C] text-white shadow-xs font-bold'
                : 'text-slate-600 hover:text-[#213F7C] hover:bg-slate-50'
            }`}
          >
            <Building2 className={`h-4 w-4 ${currentView === 'agents' ? 'text-white' : 'text-slate-500'}`} />
            <span>Partner Agencies</span>
          </button>
        </nav>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 shrink-0 z-10">
          {/* Role Switcher */}
          <button
            onClick={onToggleRole}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors cursor-pointer ${
              userRole === 'ADMIN'
                ? 'border-[#213F7C]/25 bg-[#213F7C]/8 text-[#213F7C] hover:bg-[#213F7C]/15'
                : 'border-slate-300 bg-slate-50 text-slate-700 hover:bg-slate-100'
            }`}
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {userRole === 'ADMIN' ? 'Head Office Admin' : 'Agent Restricted'}
            </span>
          </button>

          {/* Add Candidate Button */}
          {userRole === 'ADMIN' && (
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 rounded-md bg-[#C0434A] hover:bg-[#A8373E] px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Candidate</span>
            </button>
          )}
        </div>
      </div>

      {/* Mobile Centered Sub-Nav for Screens < 768px */}
      <div className="md:hidden border-t border-slate-100 bg-slate-50/70 px-2 py-1.5 flex items-center justify-center gap-1 overflow-x-auto">
        <button
          onClick={() => onViewChange('candidates')}
          className={`flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
            currentView === 'candidates' || currentView === 'kanban'
              ? 'bg-[#213F7C] text-white shadow-2xs font-bold'
              : 'text-slate-600 hover:text-[#213F7C]'
          }`}
        >
          <LayoutDashboard className="h-3 w-3" />
          <span>Operations Desk</span>
        </button>
        <button
          onClick={() => onViewChange('dashboard')}
          className={`flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
            currentView === 'dashboard'
              ? 'bg-[#213F7C] text-white shadow-2xs font-bold'
              : 'text-slate-600 hover:text-[#213F7C]'
          }`}
        >
          <BarChart3 className="h-3 w-3" />
          <span>Insights</span>
        </button>
        <button
          onClick={() => onViewChange('agents')}
          className={`flex items-center gap-1 rounded px-2.5 py-1 text-[11px] font-semibold transition-colors cursor-pointer shrink-0 ${
            currentView === 'agents'
              ? 'bg-[#213F7C] text-white shadow-2xs font-bold'
              : 'text-slate-600 hover:text-[#213F7C]'
          }`}
        >
          <Building2 className="h-3 w-3" />
          <span>Agencies</span>
        </button>
      </div>
    </header>
  );
}
