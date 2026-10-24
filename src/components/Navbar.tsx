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
        {/* Brand Identity & Navigation */}
        <div className="flex items-center gap-8">
          <div
            className="flex items-center gap-3 cursor-pointer select-none"
            onClick={() => onViewChange('dashboard')}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-white font-bold text-sm shadow-xs">
              SB
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-slate-900">
                  Sky Bridge
                </span>
                <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600 border border-slate-200">
                  North Macedonia
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Visa Consultancy & Operations
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => onViewChange('dashboard')}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                currentView === 'dashboard'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-slate-500" />
              Dashboard
            </button>
            <button
              onClick={() => onViewChange('candidates')}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                currentView === 'candidates'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="h-4 w-4 text-slate-500" />
              Candidates
            </button>
            <button
              onClick={() => onViewChange('kanban')}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                currentView === 'kanban'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <KanbanSquare className="h-4 w-4 text-slate-500" />
              Pipeline Board
            </button>
            <button
              onClick={() => onViewChange('agents')}
              className={`flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                currentView === 'agents'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Building2 className="h-4 w-4 text-slate-500" />
              Partner Agencies
            </button>
          </nav>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5">
          {/* Role Switcher */}
          <button
            onClick={onToggleRole}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors ${
              userRole === 'ADMIN'
                ? 'border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100'
                : 'border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100'
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
              className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-slate-800 transition-colors"
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
