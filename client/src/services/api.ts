import {
  SecurityIncident,
  IncidentDossier,
  AttackPreset,
  IncidentStatus,
  ResponseRecommendation
} from '../types.ts';

const API_BASE = '/api';

export async function fetchIncidents(): Promise<SecurityIncident[]> {
  const res = await fetch(`${API_BASE}/incidents`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch incidents');
  return json.data;
}

export async function fetchIncidentDossier(id: string): Promise<IncidentDossier> {
  const res = await fetch(`${API_BASE}/incidents/${id}`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch incident details');
  return json.data;
}

export async function analyzeLogs(params: {
  rawLogs: string;
  title?: string;
  sourceSummary?: string;
}): Promise<IncidentDossier> {
  const res = await fetch(`${API_BASE}/incidents/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to execute Super Agent triage');
  return json.data;
}

export async function updateIncidentStatus(id: string, status: IncidentStatus): Promise<void> {
  const res = await fetch(`${API_BASE}/incidents/${id}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update status');
}

export async function updateRecommendationStatus(
  recId: string,
  status: ResponseRecommendation['execution_status']
): Promise<void> {
  const res = await fetch(`${API_BASE}/incidents/recommendations/${recId}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status })
  });
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to update recommendation');
}

export async function fetchPresets(): Promise<AttackPreset[]> {
  const res = await fetch(`${API_BASE}/presets`);
  const json = await res.json();
  if (!json.success) throw new Error(json.error || 'Failed to fetch presets');
  return json.data;
}
