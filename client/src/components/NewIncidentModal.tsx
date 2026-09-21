import React, { useState, useEffect } from 'react';
import { AttackPreset } from '../types.ts';
import { fetchPresets, analyzeLogs } from '../services/api.ts';
import { X, Sparkles, Terminal, FileText, AlertCircle, Loader2 } from 'lucide-react';

interface NewIncidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onIncidentCreated: (newIncidentId: string) => void;
}

export const NewIncidentModal: React.FC<NewIncidentModalProps> = ({
  isOpen,
  onClose,
  onIncidentCreated
}) => {
  const [presets, setPresets] = useState<AttackPreset[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [sourceSummary, setSourceSummary] = useState('');
  const [rawLogs, setRawLogs] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      fetchPresets()
        .then((data) => {
          setPresets(data);
          if (data.length > 0 && !selectedPresetId) {
            handleSelectPreset(data[0]);
          }
        })
        .catch((err) => console.error('Failed to load presets', err));
    }
  }, [isOpen]);

  const handleSelectPreset = (preset: AttackPreset) => {
    setSelectedPresetId(preset.id);
    setTitle(preset.name);
    setSourceSummary(preset.source);
    setRawLogs(preset.rawLogs);
  };

  const handleLaunchTriage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawLogs.trim()) {
      setError('Please provide raw security logs or choose a preset.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const dossier = await analyzeLogs({
        rawLogs,
        title: title.trim() || undefined,
        sourceSummary: sourceSummary.trim() || undefined
      });
      onIncidentCreated(dossier.incident.id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to analyze incident');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      <div className="cyber-card w-full max-w-2xl rounded-2xl p-6 border-cyan-500/40 shadow-2xl shadow-cyan-950/60 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center space-x-2.5">
            <div className="rounded-lg bg-cyan-600/20 p-2 border border-cyan-500/30">
              <Sparkles className="h-5 w-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Ingest Security Logs & Launch Super-Agent</h2>
              <p className="text-xs text-slate-400">Autonomous multi-agent correlation, threat extraction & triage</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white rounded-lg p-1.5 hover:bg-slate-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 rounded-xl bg-rose-950/40 p-3 border border-rose-800/60 text-xs text-rose-300 flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLaunchTriage} className="mt-4 space-y-4">
          {/* Attack Presets Carousel/Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 font-mono">
              Select Simulated Attack Scenario Preset
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {presets.map((p) => {
                const isSelected = p.id === selectedPresetId;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    className={`text-left p-2.5 rounded-xl border text-xs transition ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-950/30 text-white shadow-sm'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-200">{p.name}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 font-mono">
                        {p.severity}
                      </span>
                    </div>
                    <p className="mt-1 text-[11px] text-slate-400 line-clamp-1">{p.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Incident Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Incident Title (Optional - auto-generated if empty)
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Distributed SSH Brute-Force on Bastion"
              className="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Source Summary */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Telemetry Sources (e.g. AuthSys, Nginx, Suricata, Sysmon)
            </label>
            <input
              type="text"
              value={sourceSummary}
              onChange={(e) => setSourceSummary(e.target.value)}
              placeholder="e.g. Linux Auth.log, Edge Firewall"
              className="w-full rounded-lg bg-slate-900 px-3 py-2 text-xs text-slate-100 placeholder-slate-500 border border-slate-800 focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Raw Logs Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1 font-mono flex items-center justify-between">
              <span>Raw Security Telemetry / Log Stream</span>
              <span className="text-slate-500 font-normal lowercase">{rawLogs.split('\n').filter(Boolean).length} lines</span>
            </label>
            <textarea
              rows={7}
              value={rawLogs}
              onChange={(e) => {
                setRawLogs(e.target.value);
                setSelectedPresetId(''); // custom
              }}
              placeholder="Paste raw syslog, firewall events, auditd records, or Nginx access logs..."
              className="w-full rounded-xl bg-slate-950 p-3 text-xs font-mono text-cyan-300 placeholder-slate-600 border border-slate-800 focus:outline-none focus:border-cyan-500 leading-relaxed"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-cyan-600/30 transition disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Super-Agent Triaging Swarm...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  <span>Launch Super-Agent Triage</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
