import React, { useState } from 'react';
import { SecurityIncident, SeverityLevel } from '../types.ts';
import { Shield, Search, ChevronRight, Clock, AlertTriangle } from 'lucide-react';

interface IncidentListProps {
  incidents: SecurityIncident[];
  selectedId: string | null;
  onSelectIncident: (id: string) => void;
}

export const IncidentList: React.FC<IncidentListProps> = ({
  incidents,
  selectedId,
  onSelectIncident
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');

  const filtered = incidents.filter((inc) => {
    const matchesSearch =
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.attack_vector && inc.attack_vector.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesSeverity = filterSeverity === 'ALL' || inc.severity === filterSeverity;
    return matchesSearch && matchesSeverity;
  });

  const getSeverityBadge = (severity: SeverityLevel) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'LOW':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40';
    }
  };

  const getStatusBadge = (status: SecurityIncident['status']) => {
    switch (status) {
      case 'NEW':
        return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
      case 'INVESTIGATING':
        return 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30';
      case 'CONTAINED':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'RESOLVED':
        return 'bg-slate-700/50 text-slate-300 border-slate-600/30';
      case 'FALSE_POSITIVE':
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="cyber-card rounded-2xl p-4 flex flex-col h-full">
      {/* Header & Search */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Shield className="h-4 w-4 text-cyan-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-wider">
            Incident Queue ({filtered.length})
          </h2>
        </div>
      </div>

      <div className="mt-3 space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search incident, threat vector, or IOC..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-lg bg-slate-900/90 pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Severity Filter Pills */}
        <div className="flex items-center space-x-1 overflow-x-auto pb-1 text-[11px]">
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((s) => (
            <button
              key={s}
              onClick={() => setFilterSeverity(s)}
              className={`px-2.5 py-1 rounded-md font-medium transition ${
                filterSeverity === s
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Incident List Items */}
      <div className="mt-3 flex-1 overflow-y-auto space-y-2 pr-1 max-h-[600px]">
        {filtered.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-slate-600" />
            No security incidents match the criteria.
          </div>
        ) : (
          filtered.map((inc) => {
            const isSelected = inc.id === selectedId;
            return (
              <div
                key={inc.id}
                onClick={() => onSelectIncident(inc.id)}
                className={`cursor-pointer rounded-xl p-3 border transition ${
                  isSelected
                    ? 'border-cyan-500 bg-cyan-950/20 shadow-md shadow-cyan-950/50'
                    : 'border-slate-800/80 bg-slate-900/40 hover:border-slate-700 hover:bg-slate-800/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold border ${getSeverityBadge(
                      inc.severity
                    )}`}
                  >
                    {inc.severity}
                  </span>
                  <span
                    className={`inline-block rounded px-2 py-0.5 text-[10px] font-mono border ${getStatusBadge(
                      inc.status
                    )}`}
                  >
                    {inc.status}
                  </span>
                </div>

                <h3 className="mt-2 text-xs font-semibold text-slate-100 line-clamp-2 hover:text-cyan-300">
                  {inc.title}
                </h3>

                <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <span className="truncate max-w-[160px] text-slate-500">
                    {inc.source_summary || 'Multi-Log'}
                  </span>
                  <div className="flex items-center space-x-1">
                    <Clock className="h-3 w-3 text-slate-500" />
                    <span>{new Date(inc.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
