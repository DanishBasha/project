import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { StatsBanner } from './components/StatsBanner.tsx';
import { IncidentList } from './components/IncidentList.tsx';
import { IncidentDetail } from './components/IncidentDetail.tsx';
import { NewIncidentModal } from './components/NewIncidentModal.tsx';
import { fetchIncidents, fetchIncidentDossier } from './services/api.ts';
import { SecurityIncident, IncidentDossier } from './types.ts';
import { Shield, AlertCircle, Loader2 } from 'lucide-react';

export const App: React.FC = () => {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);
  const [activeDossier, setActiveDossier] = useState<IncidentDossier | null>(null);
  const [loadingList, setLoadingList] = useState(true);
  const [loadingDossier, setLoadingDossier] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 1. Load Incidents Queue
  const loadIncidents = async (selectId?: string) => {
    try {
      setLoadingList(true);
      const data = await fetchIncidents();
      setIncidents(data);

      const targetId = selectId || selectedIncidentId || (data.length > 0 ? data[0].id : null);
      if (targetId) {
        setSelectedIncidentId(targetId);
        await loadDossier(targetId);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load security incidents');
    } finally {
      setLoadingList(false);
    }
  };

  // 2. Load Selected Incident Dossier
  const loadDossier = async (id: string) => {
    try {
      setLoadingDossier(true);
      const dossier = await fetchIncidentDossier(id);
      setActiveDossier(dossier);
    } catch (err: any) {
      console.error('Failed to load dossier', err);
    } finally {
      setLoadingDossier(false);
    }
  };

  useEffect(() => {
    loadIncidents();
  }, []);

  const handleSelectIncident = (id: string) => {
    setSelectedIncidentId(id);
    loadDossier(id);
  };

  const handleIncidentCreated = (newId: string) => {
    loadIncidents(newId);
  };

  return (
    <div className="min-h-screen bg-[#070a12] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar
        onOpenNewIncident={() => setIsModalOpen(true)}
        incidentCount={incidents.length}
      />

      <main className="flex-1 mx-auto max-w-7xl w-full px-4 sm:px-6 py-6 space-y-6">
        {/* Top SOC Metrics */}
        <StatsBanner incidents={incidents} />

        {/* Global Error Banner */}
        {error && (
          <div className="rounded-xl bg-rose-950/40 p-4 border border-rose-800/60 text-xs text-rose-300 flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 shrink-0 text-rose-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Operational Grid: Incident Queue + Active Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Incident List (4 cols) */}
          <div className="lg:col-span-4">
            {loadingList ? (
              <div className="cyber-card rounded-2xl p-12 text-center text-slate-400">
                <Loader2 className="h-6 w-6 animate-spin mx-auto text-cyan-400 mb-2" />
                <span className="text-xs font-mono">Syncing Incident Queue...</span>
              </div>
            ) : (
              <IncidentList
                incidents={incidents}
                selectedId={selectedIncidentId}
                onSelectIncident={handleSelectIncident}
              />
            )}
          </div>

          {/* Right Column: Active Incident Dossier Workspace (8 cols) */}
          <div className="lg:col-span-8">
            {loadingDossier ? (
              <div className="cyber-card rounded-2xl p-20 text-center text-slate-400">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-cyan-400 mb-3" />
                <span className="text-xs font-mono">Super-Agent Compiling Incident Dossier...</span>
              </div>
            ) : activeDossier ? (
              <IncidentDetail
                dossier={activeDossier}
                onReload={() => selectedIncidentId && loadDossier(selectedIncidentId)}
              />
            ) : (
              <div className="cyber-card rounded-2xl p-16 text-center text-slate-500 text-xs">
                <Shield className="h-10 w-10 mx-auto mb-3 text-slate-600" />
                <p>No active incident selected.</p>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="mt-4 px-4 py-2 rounded-lg bg-cyan-600 text-white font-bold text-xs hover:bg-cyan-500 transition"
                >
                  Ingest First Security Incident
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Ingest Logs Modal */}
      <NewIncidentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onIncidentCreated={handleIncidentCreated}
      />
    </div>
  );
};

export default App;
