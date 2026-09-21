export type SeverityLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type IncidentStatus = 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'RESOLVED' | 'FALSE_POSITIVE';
export type IocType = 'IP' | 'DOMAIN' | 'URL' | 'HASH_SHA256' | 'HASH_MD5' | 'EMAIL' | 'USER_ACCOUNT' | 'FILE_PATH';
export type ActionType = 'CONTAINMENT' | 'ERADICATION' | 'RECOVERY' | 'INVESTIGATION';
export type PriorityLevel = 'P1_IMMEDIATE' | 'P2_HIGH' | 'P3_MEDIUM' | 'P4_LOW';

export interface SecurityIncident {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  status: IncidentStatus;
  attack_vector?: string;
  source_summary?: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentLog {
  id: string;
  incident_id: string;
  source: string;
  log_level: string;
  timestamp: string;
  raw_message: string;
  structured_data?: Record<string, any>;
}

export interface IndicatorOfCompromise {
  id: string;
  incident_id: string;
  ioc_type: IocType;
  ioc_value: string;
  threat_intel_score: number;
  reputation: 'BENIGN' | 'SUSPICIOUS' | 'MALICIOUS' | 'UNKNOWN';
  defanged_value: string;
  extracted_at: string;
}

export interface ThreatFinding {
  id: string;
  incident_id: string;
  threat_category: string;
  confidence_score: number;
  evidence_summary: string;
  detected_at: string;
}

export interface MitreTechnique {
  id: string;
  incident_id: string;
  technique_id: string;
  technique_name: string;
  tactic: string;
  url: string;
  relevance_note: string;
}

export interface RiskAssessment {
  id: string;
  incident_id: string;
  overall_severity: SeverityLevel;
  risk_score: number;
  affected_assets_count: number;
  blast_radius: string;
  business_impact: string;
  compliance_concerns: string[];
  evaluated_at: string;
}

export interface ResponseRecommendation {
  id: string;
  incident_id: string;
  action_title: string;
  action_type: ActionType;
  priority: PriorityLevel;
  execution_status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DISMISSED';
  command_snippet?: string;
  assigned_to?: string;
  created_at: string;
}

export interface AgentExecution {
  id: string;
  incident_id: string;
  agent_name: string;
  step_number: number;
  input_payload: Record<string, any>;
  output_payload: Record<string, any>;
  execution_time_ms: number;
  status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED';
  error_message?: string;
  created_at: string;
}

export interface IncidentDossier {
  incident: SecurityIncident;
  logs: IncidentLog[];
  iocs: IndicatorOfCompromise[];
  threatFindings: ThreatFinding[];
  mitreTechniques: MitreTechnique[];
  riskAssessment: RiskAssessment | null;
  recommendations: ResponseRecommendation[];
  agentExecutions: AgentExecution[];
}

export interface AttackPreset {
  id: string;
  name: string;
  category: string;
  severity: SeverityLevel;
  description: string;
  source: string;
  rawLogs: string;
}
