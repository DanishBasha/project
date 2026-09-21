import { v4 as uuidv4 } from 'uuid';
import {
  ResponseRecommendation,
  RiskAssessment,
  IndicatorOfCompromise,
  ThreatFinding
} from '../types.js';
import { containmentCliGeneratorTool } from '../tools/agentTools.js';

export interface ResponsePlanResult {
  recommendations: ResponseRecommendation[];
  immediateCount: number;
  summary: string;
  toolsUsed: string[];
}

export class ResponseAgent {
  name = 'Response Playbook Agent';
  role = 'Incident mitigation, containment playbooks, eradication protocols, and analyst guidance';
  tools = [containmentCliGeneratorTool.name];

  async generatePlaybook(
    incidentId: string,
    risk: RiskAssessment,
    threats: ThreatFinding[],
    iocs: IndicatorOfCompromise[]
  ): Promise<ResponsePlanResult> {
    const recommendations: ResponseRecommendation[] = [];
    const maliciousIps = iocs.filter((i) => i.ioc_type === 'IP' && i.reputation === 'MALICIOUS').map((i) => i.ioc_value);
    const compromisedUsers = iocs.filter((i) => i.ioc_type === 'USER_ACCOUNT').map((i) => i.ioc_value);
    const maliciousDomains = iocs.filter((i) => i.ioc_type === 'DOMAIN').map((i) => i.ioc_value);

    // 1. IP Ingress Blocking using containmentCliGeneratorTool
    if (maliciousIps.length > 0) {
      const targetIp = maliciousIps[0];
      const toolRes = containmentCliGeneratorTool.execute({ actionType: 'IP_BLOCK', targetValue: targetIp });
      recommendations.push({
        id: uuidv4(),
        incident_id: incidentId,
        action_title: `Block External Adversary IP: ${targetIp}`,
        action_type: 'CONTAINMENT',
        priority: 'P1_IMMEDIATE',
        execution_status: 'PENDING',
        command_snippet: toolRes.command,
        assigned_to: 'Tier 1 SOC Analyst',
        created_at: new Date().toISOString()
      });
    }

    // 2. Account Invalidation using containmentCliGeneratorTool
    if (compromisedUsers.length > 0) {
      const targetUser = compromisedUsers[0];
      const toolRes = containmentCliGeneratorTool.execute({ actionType: 'ACCOUNT_LOCK', targetValue: targetUser });
      recommendations.push({
        id: uuidv4(),
        incident_id: incidentId,
        action_title: `Revoke Sessions & Invalidate Credential: user "${targetUser}"`,
        action_type: 'ERADICATION',
        priority: 'P1_IMMEDIATE',
        execution_status: 'PENDING',
        command_snippet: toolRes.command,
        assigned_to: 'Systems Administrator',
        created_at: new Date().toISOString()
      });
    }

    // 3. Domain Sinkholing using containmentCliGeneratorTool
    if (maliciousDomains.length > 0) {
      const targetDomain = maliciousDomains[0];
      const toolRes = containmentCliGeneratorTool.execute({ actionType: 'DOMAIN_SINKHOLE', targetValue: targetDomain });
      recommendations.push({
        id: uuidv4(),
        incident_id: incidentId,
        action_title: `Sinkhole C2 Domain: ${targetDomain} via CoreDNS/Pi-hole`,
        action_type: 'CONTAINMENT',
        priority: 'P2_HIGH',
        execution_status: 'PENDING',
        command_snippet: toolRes.command,
        assigned_to: 'Network Security Team',
        created_at: new Date().toISOString()
      });
    }

    // 4. Host Isolation & Forensics
    recommendations.push({
      id: uuidv4(),
      incident_id: incidentId,
      action_title: 'Quarantine Host to Security Group & Capture Memory Volatility',
      action_type: 'CONTAINMENT',
      priority: risk.overall_severity === 'CRITICAL' ? 'P1_IMMEDIATE' : 'P2_HIGH',
      execution_status: 'PENDING',
      command_snippet: 'lime-forensics-dump --output /mnt/evidence/mem_dump.raw --compress',
      assigned_to: 'Incident Commander',
      created_at: new Date().toISOString()
    });

    const immediate = recommendations.filter((r) => r.priority === 'P1_IMMEDIATE').length;

    return {
      recommendations,
      immediateCount: immediate,
      summary: `Generated ${recommendations.length} mitigation actions using tool [${containmentCliGeneratorTool.name}].`,
      toolsUsed: [containmentCliGeneratorTool.name]
    };
  }
}

export const responseAgent = new ResponseAgent();
