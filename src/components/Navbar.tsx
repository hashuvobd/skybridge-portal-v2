'use client';

import React from 'react';
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Building2,
  Plus,
  Shield,
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
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand Logo & Navigation */}
        <div className="flex items-center gap-8">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onViewChange('dashboard')}
          >
            <img
              src="/logo.png"
              alt="Sky Bridge Visa Consultancy"
              className="h-10 w-auto max-w-[200px] object-contain"
            />
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'dashboard'
                  ? 'bg-[#213F7C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#213F7C] hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className={`h-4 w-4 ${currentView === 'dashboard' ? 'text-white' : 'text-slate-500'}`} />
              Dashboard
            </button>
            <button
              onClick={() => onViewChange('candidates')}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'candidates'
                  ? 'bg-[#213F7C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#213F7C] hover:bg-slate-50'
              }`}
            >
              <Users className={`h-4 w-4 ${currentView === 'candidates' ? 'text-white' : 'text-slate-500'}`} />
              Candidates
            </button>
            <button
              onClick={() => onViewChange('kanban')}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'kanban'
                  ? 'bg-[#213F7C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#213F7C] hover:bg-slate-50'
              }`}
            >
              <KanbanSquare className={`h-4 w-4 ${currentView === 'kanban' ? 'text-white' : 'text-slate-500'}`} />
              Pipeline Board
            </button>
            <button
              onClick={() => onViewChange('agents')}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-semibold transition-colors cursor-pointer ${
                currentView === 'agents'
                  ? 'bg-[#213F7C] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#213F7C] hover:bg-slate-50'
              }`}
            >
              <Building2 className={`h-4 w-4 ${currentView === 'agents' ? 'text-white' : 'text-slate-500'}`} />
              Partner Agencies
            </button>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
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
    </header>
  );
}
