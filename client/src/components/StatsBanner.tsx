import React from 'react';
import { SecurityIncident } from '../types.ts';
import { AlertOctagon, Flame, ShieldAlert, CheckCircle2, Cpu, Zap } from 'lucide-react';

interface StatsBannerProps {
  incidents: SecurityIncident[];
}

export const StatsBanner: React.FC<StatsBannerProps> = ({ incidents }) => {
  const total = incidents.length;
  const critical = incidents.filter((i) => i.severity === 'CRITICAL').length;
  const high = incidents.filter((i) => i.severity === 'HIGH').length;
  const investigating = incidents.filter((i) => i.status === 'INVESTIGATING' || i.status === 'NEW').length;
  const resolved = incidents.filter((i) => i.status === 'CONTAINED' || i.status === 'RESOLVED').length;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {/* Total Incidents */}
      <div className="cyber-card rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-slate-400">
          <span className="text-xs font-medium uppercase tracking-wider">Total Events</span>
          <ShieldAlert className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-white font-mono">{total}</span>
          <span className="text-[10px] text-cyan-400 font-mono">ALL SOURCES</span>
        </div>
      </div>

      {/* Critical Incidents */}
      <div className="cyber-card rounded-xl p-3.5 flex flex-col justify-between border-rose-900/40 bg-rose-950/10">
        <div className="flex items-center justify-between text-rose-400">
          <span className="text-xs font-medium uppercase tracking-wider">Critical</span>
          <Flame className="h-4 w-4 text-rose-400 animate-pulse" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-rose-300 font-mono">{critical}</span>
          <span className="text-[10px] text-rose-400/80 font-mono">P1 URGENT</span>
        </div>
      </div>

      {/* High Incidents */}
      <div className="cyber-card rounded-xl p-3.5 flex flex-col justify-between border-amber-900/40 bg-amber-950/10">
        <div className="flex items-center justify-between text-amber-400">
          <span className="text-xs font-medium uppercase tracking-wider">High Risk</span>
          <AlertOctagon className="h-4 w-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-amber-300 font-mono">{high}</span>
          <span className="text-[10px] text-amber-400/80 font-mono">PRIORITY 2</span>
        </div>
      </div>

      {/* Active Investigations */}
      <div className="cyber-card rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between text-indigo-400">
          <span className="text-xs font-medium uppercase tracking-wider">Investigating</span>
          <Zap className="h-4 w-4 text-indigo-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-indigo-200 font-mono">{investigating}</span>
          <span className="text-[10px] text-indigo-400 font-mono">ACTIVE AGENTS</span>
        </div>
      </div>

      {/* Resolved / Contained */}
      <div className="cyber-card rounded-xl p-3.5 flex flex-col justify-between border-emerald-900/30 bg-emerald-950/10">
        <div className="flex items-center justify-between text-emerald-400">
          <span className="text-xs font-medium uppercase tracking-wider">Mitigated</span>
          <CheckCircle2 className="h-4 w-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-emerald-300 font-mono">{resolved}</span>
          <span className="text-[10px] text-emerald-400 font-mono">CONTAINED</span>
        </div>
      </div>

      {/* Multi-Agent Latency */}
      <div className="cyber-card rounded-xl p-3.5 flex flex-col justify-between border-cyan-900/30 bg-cyan-950/10">
        <div className="flex items-center justify-between text-cyan-400">
          <span className="text-xs font-medium uppercase tracking-wider">Avg Latency</span>
          <Cpu className="h-4 w-4 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline justify-between">
          <span className="text-2xl font-bold text-cyan-200 font-mono">820<span className="text-xs font-normal">ms</span></span>
          <span className="text-[10px] text-cyan-400 font-mono">6 AGENTS</span>
        </div>
      </div>
    </div>
  );
};
