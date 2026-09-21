import React, { useState } from 'react';
import { IncidentDossier, IncidentStatus, SeverityLevel } from '../types.ts';
import { SuperAgentWorkflow } from './SuperAgentWorkflow.tsx';
import { MitreMatrixView } from './MitreMatrixView.tsx';
import { IocTableView } from './IocTableView.tsx';
import { ResponsePlanView } from './ResponsePlanView.tsx';
import { updateIncidentStatus } from '../services/api.ts';
import {
  ShieldAlert,
  Terminal,
  Crosshair,
  FileSearch,
  CheckCircle,
  Cpu,
  Layers,
  AlertTriangle,
  Clock,
  Building2,
  Lock
} from 'lucide-react';

interface IncidentDetailProps {
  dossier: IncidentDossier;
  onReload: () => void;
}

type TabType = 'workflow' | 'mitre' | 'iocs' | 'playbook' | 'logs' | 'impact';

export const IncidentDetail: React.FC<IncidentDetailProps> = ({ dossier, onReload }) => {
  const [activeTab, setActiveTab] = useState<TabType>('workflow');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const { incident, logs, iocs, threatFindings, mitreTechniques, riskAssessment, recommendations, agentExecutions } =
    dossier;

  const handleStatusChange = async (newStatus: IncidentStatus) => {
    try {
      setUpdatingStatus(true);
      await updateIncidentStatus(incident.id, newStatus);
      onReload();
    } catch (err) {
      console.error('Failed to change incident status', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const getSeverityStyle = (s: SeverityLevel) => {
    switch (s) {
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

  return (
    <div className="cyber-card rounded-2xl p-5 space-y-5">
      {/* Incident Header & Meta */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="space-y-1.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`px-2.5 py-0.5 rounded text-xs font-bold border font-mono ${getSeverityStyle(incident.severity)}`}>
              {incident.severity}
            </span>
            <span className="text-xs font-mono text-slate-500">
              ID: {incident.id.slice(0, 13)}...
            </span>
            <span className="text-xs text-slate-400 font-mono flex items-center space-x-1">
              <Clock className="h-3 w-3 text-slate-500" />
              <span>{new Date(incident.created_at).toLocaleString()}</span>
            </span>
          </div>

          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
            {incident.title}
          </h2>

          <p className="text-xs text-slate-400 leading-relaxed">
            {incident.description}
          </p>
        </div>

        {/* Status Dropdown Controller */}
        <div className="flex flex-col items-end space-y-1.5">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Incident Status
          </label>
          <select
            value={incident.status}
            onChange={(e) => handleStatusChange(e.target.value as IncidentStatus)}
            disabled={updatingStatus}
            className="rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-200 border border-slate-700 focus:outline-none focus:border-cyan-500 cursor-pointer font-mono"
          >
            <option value="NEW">NEW</option>
            <option value="INVESTIGATING">INVESTIGATING</option>
            <option value="CONTAINED">CONTAINED</option>
            <option value="RESOLVED">RESOLVED</option>
            <option value="FALSE_POSITIVE">FALSE POSITIVE</option>
          </select>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800 flex items-center space-x-3">
          <div className="rounded-lg bg-rose-500/10 p-2 text-rose-400 border border-rose-500/20">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-mono">Risk Score</div>
            <div className="text-sm font-bold text-white font-mono">
              {riskAssessment ? `${riskAssessment.risk_score}/100` : 'N/A'}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800 flex items-center space-x-3">
          <div className="rounded-lg bg-indigo-500/10 p-2 text-indigo-400 border border-indigo-500/20">
            <Building2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-mono">Blast Radius</div>
            <div className="text-xs font-bold text-slate-200 truncate max-w-[120px]">
              {riskAssessment ? riskAssessment.blast_radius : 'Localized'}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800 flex items-center space-x-3">
          <div className="rounded-lg bg-cyan-500/10 p-2 text-cyan-400 border border-cyan-500/20">
            <FileSearch className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-mono">Extracted IOCs</div>
            <div className="text-sm font-bold text-cyan-300 font-mono">{iocs.length}</div>
          </div>
        </div>

        <div className="rounded-xl bg-slate-900/60 p-3 border border-slate-800 flex items-center space-x-3">
          <div className="rounded-lg bg-emerald-500/10 p-2 text-emerald-400 border border-emerald-500/20">
            <CheckCircle className="h-4 w-4" />
          </div>
          <div>
            <div className="text-[10px] uppercase text-slate-400 font-mono">Playbooks</div>
            <div className="text-sm font-bold text-emerald-300 font-mono">
              {recommendations.length} Actions
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 overflow-x-auto space-x-1 text-xs">
        <button
          onClick={() => setActiveTab('workflow')}
          className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 font-semibold transition whitespace-nowrap ${
            activeTab === 'workflow'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Cpu className="h-4 w-4" />
          <span>Super-Agent Trace ({agentExecutions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('mitre')}
          className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 font-semibold transition whitespace-nowrap ${
            activeTab === 'mitre'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Crosshair className="h-4 w-4" />
          <span>MITRE ATT&CK ({mitreTechniques.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('iocs')}
          className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 font-semibold transition whitespace-nowrap ${
            activeTab === 'iocs'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <FileSearch className="h-4 w-4" />
          <span>Threat IOCs ({iocs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('playbook')}
          className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 font-semibold transition whitespace-nowrap ${
            activeTab === 'playbook'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <ShieldAlert className="h-4 w-4" />
          <span>Remediation Plan ({recommendations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 font-semibold transition whitespace-nowrap ${
            activeTab === 'logs'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Terminal className="h-4 w-4" />
          <span>Raw Logs ({logs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('impact')}
          className={`flex items-center space-x-2 px-4 py-2.5 border-b-2 font-semibold transition whitespace-nowrap ${
            activeTab === 'impact'
              ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
          }`}
        >
          <Layers className="h-4 w-4" />
          <span>Risk & Compliance</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'workflow' && (
          <SuperAgentWorkflow executions={agentExecutions} />
        )}

        {activeTab === 'mitre' && (
          <MitreMatrixView techniques={mitreTechniques} />
        )}

        {activeTab === 'iocs' && (
          <IocTableView iocs={iocs} />
        )}

        {activeTab === 'playbook' && (
          <ResponsePlanView
            recommendations={recommendations}
            onReloadDossier={onReload}
          />
        )}

        {activeTab === 'logs' && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
              <span>Telemetry Feed ({logs.length} events logged)</span>
              <span>Incident ID: {incident.id}</span>
            </div>
            <div className="rounded-xl bg-slate-950 p-4 border border-slate-800 font-mono text-xs overflow-x-auto max-h-[480px] space-y-1.5">
              {logs.map((log) => (
                <div key={log.id} className="leading-relaxed hover:bg-slate-900/60 p-1 rounded">
                  <span className="text-slate-500">[{log.timestamp}]</span>{' '}
                  <span className="text-indigo-400 font-bold">[{log.source}]</span>{' '}
                  <span
                    className={
                      log.log_level === 'ALERT' || log.log_level === 'CRITICAL'
                        ? 'text-rose-400 font-bold'
                        : log.log_level === 'WARN'
                        ? 'text-amber-400'
                        : 'text-slate-300'
                    }
                  >
                    {log.raw_message}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'impact' && riskAssessment && (
          <div className="space-y-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <ShieldAlert className="h-4 w-4 text-cyan-400" />
                <span>Organizational Blast Radius & Business Impact</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {riskAssessment.business_impact}
              </p>

              <div className="mt-3 pt-3 border-t border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                  Regulatory & Compliance Standards Impacted:
                </span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {riskAssessment.compliance_concerns.map((comp, i) => (
                    <span
                      key={i}
                      className="px-3 py-1 rounded-lg bg-indigo-950/40 border border-indigo-800/60 text-indigo-300 text-xs font-mono font-semibold"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
