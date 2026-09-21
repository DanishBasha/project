import React, { useState } from 'react';
import { ResponseRecommendation, PriorityLevel, ActionType } from '../types.ts';
import { Terminal, CheckCircle2, Clock, Play, Copy, Check, ShieldAlert } from 'lucide-react';
import { updateRecommendationStatus } from '../services/api.ts';

interface ResponsePlanViewProps {
  recommendations: ResponseRecommendation[];
  onReloadDossier: () => void;
}

export const ResponsePlanView: React.FC<ResponsePlanViewProps> = ({
  recommendations,
  onReloadDossier
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleCopySnippet = (id: string, snippet: string) => {
    navigator.clipboard.writeText(snippet);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1800);
  };

  const handleToggleStatus = async (rec: ResponseRecommendation) => {
    const nextStatus =
      rec.execution_status === 'PENDING'
        ? 'IN_PROGRESS'
        : rec.execution_status === 'IN_PROGRESS'
        ? 'COMPLETED'
        : 'PENDING';

    try {
      setUpdatingId(rec.id);
      await updateRecommendationStatus(rec.id, nextStatus);
      onReloadDossier();
    } catch (err) {
      console.error('Failed to update recommendation status', err);
    } finally {
      setUpdatingId(null);
    }
  };

  const getPriorityBadge = (p: PriorityLevel) => {
    switch (p) {
      case 'P1_IMMEDIATE':
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'P2_HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'P3_MEDIUM':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40';
      case 'P4_LOW':
        return 'bg-slate-700 text-slate-300 border-slate-600';
    }
  };

  const getActionBadge = (a: ActionType) => {
    switch (a) {
      case 'CONTAINMENT':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'ERADICATION':
        return 'bg-purple-500/10 text-purple-300 border-purple-500/30';
      case 'RECOVERY':
        return 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
      case 'INVESTIGATION':
        return 'bg-blue-500/10 text-blue-300 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center space-x-2">
            <ShieldAlert className="h-4 w-4 text-emerald-400" />
            <span>Remediation & Containment Playbook</span>
          </h3>
          <p className="text-xs text-slate-400">
            Formulated by Response Agent for human-in-the-loop analyst approval
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {recommendations.map((rec) => {
          const isCompleted = rec.execution_status === 'COMPLETED';
          const isInProgress = rec.execution_status === 'IN_PROGRESS';

          return (
            <div
              key={rec.id}
              className={`rounded-xl border p-4 transition ${
                isCompleted
                  ? 'border-emerald-900/40 bg-emerald-950/10 opacity-75'
                  : isInProgress
                  ? 'border-indigo-800/60 bg-indigo-950/20 shadow-md'
                  : 'border-slate-800 bg-slate-900/50 hover:border-slate-700'
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold border font-mono ${getPriorityBadge(rec.priority)}`}>
                    {rec.priority.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${getActionBadge(rec.action_type)}`}>
                    {rec.action_type}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Owner: <strong className="text-slate-200">{rec.assigned_to || 'SOC Analyst'}</strong>
                  </span>
                </div>

                <button
                  onClick={() => handleToggleStatus(rec)}
                  disabled={updatingId === rec.id}
                  className={`flex items-center space-x-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition ${
                    isCompleted
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-600/50'
                      : isInProgress
                      ? 'bg-indigo-600/40 text-indigo-200 border border-indigo-500/40 hover:bg-indigo-600/60'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                  }`}
                >
                  {isCompleted ? (
                    <>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Completed</span>
                    </>
                  ) : isInProgress ? (
                    <>
                      <Clock className="h-3.5 w-3.5 text-indigo-400 animate-spin" />
                      <span>In Progress</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-3.5 w-3.5 text-slate-400" />
                      <span>Start Action</span>
                    </>
                  )}
                </button>
              </div>

              <h4 className={`mt-2 text-xs font-bold text-white ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                {rec.action_title}
              </h4>

              {/* Command Snippet Box */}
              {rec.command_snippet && (
                <div className="mt-2.5 relative rounded-lg bg-slate-950 p-2.5 border border-slate-800/80 font-mono text-xs group">
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mb-1">
                    <span className="flex items-center space-x-1">
                      <Terminal className="h-3 w-3 text-cyan-400" />
                      <span>Remediation CLI Snippet</span>
                    </span>
                    <button
                      onClick={() => handleCopySnippet(rec.id, rec.command_snippet!)}
                      className="text-slate-400 hover:text-white flex items-center space-x-1 transition"
                    >
                      {copiedId === rec.id ? (
                        <>
                          <Check className="h-3 w-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <code className="text-cyan-300 block overflow-x-auto whitespace-pre">
                    {rec.command_snippet}
                  </code>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
