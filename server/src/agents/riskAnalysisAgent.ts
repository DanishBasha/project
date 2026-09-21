import { v4 as uuidv4 } from 'uuid';
import { RiskAssessment, ThreatFinding, IndicatorOfCompromise } from '../types.js';
import { blastRadiusEvaluatorTool } from '../tools/agentTools.js';

export interface RiskAnalysisResult {
  riskAssessment: RiskAssessment;
  summary: string;
  toolsUsed: string[];
}

export class RiskAnalysisAgent {
  name = 'Risk Analysis Agent';
  role = 'Blast radius estimation, compliance risk determination, and business severity scoring';
  tools = [blastRadiusEvaluatorTool.name];

  async evaluate(
    incidentId: string,
    threatFindings: ThreatFinding[],
    iocs: IndicatorOfCompromise[]
  ): Promise<RiskAnalysisResult> {
    const primaryThreat = threatFindings[0]?.threat_category || 'General Security Incident';
    const maxConfidence = Math.max(...threatFindings.map((f) => f.confidence_score), 75);

    // 1. Invoke Tool: blast_radius_evaluator_tool
    const toolEval = blastRadiusEvaluatorTool.execute({
      threatCategory: primaryThreat,
      confidenceScore: maxConfidence
    });

    const hasExternalMaliciousIoc = iocs.some((i) => i.reputation === 'MALICIOUS');
    let finalScore = toolEval.riskScore;
    if (hasExternalMaliciousIoc && finalScore < 85) {
      finalScore = Math.min(100, finalScore + 8);
    }

    const assessment: RiskAssessment = {
      id: uuidv4(),
      incident_id: incidentId,
      overall_severity: toolEval.severity,
      risk_score: finalScore,
      affected_assets_count: toolEval.affectedAssets,
      blast_radius: toolEval.blastRadius,
      business_impact: `Evaluated impact for ${primaryThreat}. Scope spans ${toolEval.blastRadius} affecting estimated ${toolEval.affectedAssets} critical asset(s).`,
      compliance_concerns: toolEval.complianceImpacts,
      evaluated_at: new Date().toISOString()
    };

    return {
      riskAssessment: assessment,
      summary: `Computed risk using tool [${blastRadiusEvaluatorTool.name}]: Severity ${assessment.overall_severity}, Score ${assessment.risk_score}/100.`,
      toolsUsed: [blastRadiusEvaluatorTool.name]
    };
  }
}

export const riskAnalysisAgent = new RiskAnalysisAgent();
