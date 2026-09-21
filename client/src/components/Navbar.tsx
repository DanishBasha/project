import React from 'react';
import { Shield, PlusCircle, Terminal, Database, Activity } from 'lucide-react';

interface NavbarProps {
  onOpenNewIncident: () => void;
  incidentCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenNewIncident, incidentCount }) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-[#070a12]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand & SOC Status */}
        <div className="flex items-center space-x-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 shadow-lg shadow-cyan-500/20">
            <Shield className="h-5 w-5 text-white" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base font-bold tracking-tight text-white sm:text-lg">
                AEGIS <span className="text-cyan-400 font-mono">SOC</span>
              </h1>
              <span className="rounded bg-cyan-950/80 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-800/50">
                SUPER-AGENT
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              AI-Powered Multi-Agent Autonomous Cybersecurity Incident Response
            </p>
          </div>
        </div>

        {/* Status Indicators & Action */}
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 rounded-lg bg-slate-900/90 px-3 py-1.5 border border-slate-800 text-xs">
            <Database className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-slate-300">Supabase Online</span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
          </div>

          <div className="hidden lg:flex items-center space-x-2 rounded-lg bg-slate-900/90 px-3 py-1.5 border border-slate-800 text-xs">
            <Activity className="h-3.5 w-3.5 text-indigo-400" />
            <span className="text-slate-300">6 Agents Swarm</span>
            <span className="text-indigo-400 font-mono font-bold">READY</span>
          </div>

          <button
            onClick={onOpenNewIncident}
            className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 px-3.5 py-2 text-xs font-semibold text-white shadow-md hover:from-cyan-500 hover:to-blue-500 transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
          >
            <PlusCircle className="h-4 w-4" />
            <span>Ingest Logs / Triage</span>
          </button>
        </div>
      </div>
    </header>
  );
};
