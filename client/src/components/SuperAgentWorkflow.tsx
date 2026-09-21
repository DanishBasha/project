import React, { useState } from 'react';
import { AgentExecution } from '../types.ts';
import { Cpu, CheckCircle2, ChevronDown, ChevronRight, Clock, Wrench, ArrowRight } from 'lucide-react';

interface SuperAgentWorkflowProps {
  executions: AgentExecution[];
}

export const SuperAgentWorkflow: React.FC<SuperAgentWorkflowProps> = ({ executions }) => {
  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>({});

  const toggleStep = (id: string) => {
    setExpandedSteps((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const totalDuration = executions.reduce((sum, e) => sum + e.execution_time_ms, 0);

  return (
    <div className="space-y-4">
      {/* Workflow Header Banner */}
      <div className="flex flex-wrap items-center justify-between rounded-xl bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/60 p-4 border border-indigo-800/40">
        <div className="flex items-center space-x-3">
          <div className="rounded-lg bg-indigo-600/30 p-2 border border-indigo-500/30">
            <Cpu className="h-5 w-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Super-Agent Multi-Agent & Tool Execution Pipeline</h3>
            <p className="text-xs text-slate-400">
              Coordinated agent function-calling audit trace in <code className="text-cyan-300 font-mono">agent_executions</code>
            </p>
          </div>
        </div>
        <div className="mt-2 sm:mt-0 flex items-center space-x-3 font-mono text-xs">
          <span className="rounded bg-slate-800/80 px-2.5 py-1 text-slate-300 border border-slate-700">
            Steps: <strong className="text-white">{executions.length}</strong>
          </span>
          <span className="rounded bg-cyan-950/60 px-2.5 py-1 text-cyan-300 border border-cyan-800/50 flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>Total: <strong>{totalDuration}ms</strong></span>
          </span>
        </div>
      </div>

      {/* Interactive Step-by-Step Chain */}
      <div className="relative border-l-2 border-slate-800 ml-4 pl-6 space-y-4">
        {executions.map((exec, idx) => {
          const isExpanded = Boolean(expandedSteps[exec.id]);
          const isOrchestrator = exec.agent_name.includes('Super Agent');
          const toolsInvoked: string[] =
            exec.output_payload?.tools_invoked || exec.input_payload?.tools_invoked || [];

          return (
            <div key={exec.id || idx} className="relative group">
              {/* Bullet Node */}
              <div
                className={`absolute -left-[31px] top-1.5 flex h-5 w-5 items-center justify-center rounded-full border ${
                  isOrchestrator
                    ? 'bg-indigo-600 border-indigo-400 text-white shadow-md shadow-indigo-500/50'
                    : 'bg-slate-900 border-cyan-500 text-cyan-400'
                }`}
              >
                <span className="text-[10px] font-bold font-mono">{exec.step_number}</span>
              </div>

              {/* Step Card */}
              <div
                className={`rounded-xl border p-3.5 transition ${
                  isOrchestrator
                    ? 'bg-indigo-950/20 border-indigo-800/60'
                    : 'bg-slate-900/50 border-slate-800/90 hover:border-slate-700'
                }`}
              >
                <div
                  className="flex items-center justify-between cursor-pointer"
                  onClick={() => toggleStep(exec.id)}
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-100 font-mono">
                      {exec.agent_name}
                    </span>
                    <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>{exec.status}</span>
                    </span>
                  </div>

                  <div className="flex items-center space-x-3 text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {exec.execution_time_ms} ms
                    </span>
                    <button className="text-slate-400 hover:text-white transition">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Explicit Tools Invoked Badges */}
                {toolsInvoked.length > 0 && (
                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono flex items-center space-x-1 mr-1">
                      <Wrench className="h-3 w-3 text-cyan-400" />
                      <span>Agent Tools Called:</span>
                    </span>
                    {toolsInvoked.map((t) => (
                      <span
                        key={t}
                        className="rounded bg-cyan-950/60 px-2 py-0.5 text-[10px] font-mono font-bold text-cyan-300 border border-cyan-800/60"
                      >
                        {t}()
                      </span>
                    ))}
                  </div>
                )}

                {/* Quick Output Summary Snippet */}
                <div className="mt-2.5 text-xs text-slate-300 font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60 overflow-x-auto">
                  <div className="text-[10px] uppercase text-indigo-400 mb-1 font-semibold flex items-center space-x-1">
                    <ArrowRight className="h-3 w-3" />
                    <span>Synthesized Output Payload:</span>
                  </div>
                  <pre className="text-[11px] whitespace-pre-wrap text-slate-200">
                    {JSON.stringify(exec.output_payload, null, 2)}
                  </pre>
                </div>

                {/* Expanded Full Payload Inspection (Inputs & Outputs) */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] font-semibold text-amber-400 font-mono">
                        RAW INPUT PAYLOAD PASSED BY SUPER-AGENT:
                      </span>
                      <pre className="mt-1 bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono overflow-x-auto">
                        {JSON.stringify(exec.input_payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
