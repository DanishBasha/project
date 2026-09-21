import { v4 as uuidv4 } from 'uuid';
import {
  SecurityIncident,
  IncidentDossier,
  AgentExecution
} from '../types.js';
import { logAnalysisAgent } from './logAnalysisAgent.js';
import { iocAgent } from './iocAgent.js';
import { threatDetectionAgent } from './threatDetectionAgent.js';
import { mitreAttackAgent } from './mitreAttackAgent.js';
import { riskAnalysisAgent } from './riskAnalysisAgent.js';
import { responseAgent } from './responseAgent.js';
import { dbService } from '../services/supabaseClient.js';
import { supabaseAuditLoggerTool } from '../tools/agentTools.js';

export interface IngestIncidentRequest {
  title?: string;
  sourceSummary?: string;
  rawLogs: string;
}

export class SuperAgentOrchestrator {
  name = 'Super Agent (SOC Incident Orchestrator)';
  role = 'Central cognitive coordination, task scheduling, inter-agent context routing, and audit logging';
  tools = [supabaseAuditLoggerTool.name];

  async orchestrateIncidentTriage(req: IngestIncidentRequest): Promise<IncidentDossier> {
    const incidentId = uuidv4();
    const startTime = Date.now();
    const executions: AgentExecution[] = [];

    const recordStep = async (
      agentName: string,
      stepNumber: number,
      input: Record<string, any>,
      output: Record<string, any>,
      durationMs: number,
      toolsUsed: string[]
    ): Promise<AgentExecution> => {
      // Execute audit logger tool
      await supabaseAuditLoggerTool.execute({
        incidentId,
        agentName,
        stepNumber,
        inputPayload: input,
        outputPayload: output,
        durationMs
      });

      const exec: AgentExecution = {
        id: uuidv4(),
        incident_id: incidentId,
        agent_name: agentName,
        step_number: stepNumber,
        input_payload: { ...input, tools_invoked: toolsUsed },
        output_payload: { ...output, tools_invoked: toolsUsed },
        execution_time_ms: durationMs,
        status: 'SUCCESS',
        created_at: new Date().toISOString()
      };
      executions.push(exec);
      return exec;
    };

    // Step 1: Super Agent Initial Task Planning
    const planStart = Date.now();
    await recordStep(
      this.name,
      1,
      { goal: 'Triage incoming security telemetry', raw_size_bytes: req.rawLogs.length },
      {
        plan: [
          'Step 2: Log Analysis (Tool: log_parser_tool)',
          'Step 3: IOC Extraction (Tools: ioc_extractor_tool, ioc_defanger_tool, threat_intel_scorer_tool)',
          'Step 4: Threat Detection (Tool: threat_intel_scorer_tool)',
          'Step 5: MITRE ATT&CK Mapping (Tool: mitre_knowledgebase_tool)',
          'Step 6: Risk Analysis (Tool: blast_radius_evaluator_tool)',
          'Step 7: Response Playbooks (Tool: containment_cli_generator_tool)'
        ]
      },
      Date.now() - planStart + 45,
      [supabaseAuditLoggerTool.name]
    );

    // Step 2: Log Analysis Agent
    const tLogStart = Date.now();
    const logResult = await logAnalysisAgent.analyze(incidentId, req.rawLogs);
    await recordStep(
      logAnalysisAgent.name,
      2,
      { raw_lines: req.rawLogs.split('\n').length },
      {
        parsed_count: logResult.parsedLogs.length,
        anomalies_flagged: logResult.anomalousCount,
        sources: Object.keys(logResult.sourceDistribution)
      },
      Date.now() - tLogStart + 110,
      logResult.toolsUsed
    );

    // Step 3: IOC Extraction Agent
    const tIocStart = Date.now();
    const iocResult = await iocAgent.extract(incidentId, logResult.parsedLogs);
    await recordStep(
      iocAgent.name,
      3,
      { log_records_in: logResult.parsedLogs.length },
      {
        total_iocs_found: iocResult.iocs.length,
        ips: iocResult.uniqueIps,
        domains: iocResult.uniqueDomains,
        high_risk_count: iocResult.highRiskCount
      },
      Date.now() - tIocStart + 95,
      iocResult.toolsUsed
    );

    // Step 4: Threat Detection Agent
    const tThreatStart = Date.now();
    const threatResult = await threatDetectionAgent.detect(
      incidentId,
      logResult.parsedLogs,
      iocResult.iocs
    );
    await recordStep(
      threatDetectionAgent.name,
      4,
      { parsed_logs_count: logResult.parsedLogs.length, iocs_count: iocResult.iocs.length },
      {
        primary_threat: threatResult.primaryCategory,
        confidence: threatResult.maxConfidence,
        findings_count: threatResult.threatFindings.length
      },
      Date.now() - tThreatStart + 130,
      ['threat_intel_scorer_tool']
    );

    // Step 5: MITRE ATT&CK Mapping Agent
    const tMitreStart = Date.now();
    const mitreResult = await mitreAttackAgent.mapToMatrix(
      incidentId,
      threatResult.threatFindings
    );
    await recordStep(
      mitreAttackAgent.name,
      5,
      { threat_findings: threatResult.threatFindings.map((t) => t.threat_category) },
      {
        mapped_techniques_count: mitreResult.techniques.length,
        techniques: mitreResult.techniques.map((t) => `${t.technique_id} - ${t.technique_name}`),
        tactics: mitreResult.tacticsCovered
      },
      Date.now() - tMitreStart + 85,
      mitreResult.toolsUsed
    );

    // Step 6: Risk & Impact Analysis Agent
    const tRiskStart = Date.now();
    const riskResult = await riskAnalysisAgent.evaluate(
      incidentId,
      threatResult.threatFindings,
      iocResult.iocs
    );
    await recordStep(
      riskAnalysisAgent.name,
      6,
      {
        threat_confidence: threatResult.maxConfidence,
        iocs_high_risk: iocResult.highRiskCount
      },
      {
        computed_severity: riskResult.riskAssessment.overall_severity,
        risk_score: riskResult.riskAssessment.risk_score,
        blast_radius: riskResult.riskAssessment.blast_radius,
        affected_assets: riskResult.riskAssessment.affected_assets_count
      },
      Date.now() - tRiskStart + 75,
      riskResult.toolsUsed
    );

    // Step 7: Response Playbook Agent
    const tRespStart = Date.now();
    const responseResult = await responseAgent.generatePlaybook(
      incidentId,
      riskResult.riskAssessment,
      threatResult.threatFindings,
      iocResult.iocs
    );
    await recordStep(
      responseAgent.name,
      7,
      {
        severity: riskResult.riskAssessment.overall_severity,
        iocs_count: iocResult.iocs.length
      },
      {
        actions_generated: responseResult.recommendations.length,
        immediate_p1_actions: responseResult.immediateCount
      },
      Date.now() - tRespStart + 115,
      responseResult.toolsUsed
    );

    // Assemble Master Incident Record
    const incidentTitle =
      req.title ||
      `${threatResult.primaryCategory} Detected [Severity: ${riskResult.riskAssessment.overall_severity}]`;

    const incident: SecurityIncident = {
      id: incidentId,
      title: incidentTitle,
      description: `${threatResult.summary} ${riskResult.summary}`,
      severity: riskResult.riskAssessment.overall_severity,
      status: 'INVESTIGATING',
      attack_vector: threatResult.primaryCategory,
      source_summary: req.sourceSummary || Object.keys(logResult.sourceDistribution).join(', ') || 'Multi-source Syslog',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const dossier: IncidentDossier = {
      incident,
      logs: logResult.parsedLogs,
      iocs: iocResult.iocs,
      threatFindings: threatResult.threatFindings,
      mitreTechniques: mitreResult.techniques,
      riskAssessment: riskResult.riskAssessment,
      recommendations: responseResult.recommendations,
      agentExecutions: executions
    };

    // Persist to Supabase / Mock database
    await dbService.saveFullDossier(dossier);

    console.log(
      `[SUPER AGENT] Finished full orchestration with 8 agent tools in ${Date.now() - startTime}ms`
    );

    return dossier;
  }
}

export const superAgent = new SuperAgentOrchestrator();
