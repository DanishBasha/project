import { v4 as uuidv4 } from 'uuid';
import { MitreTechnique, ThreatFinding } from '../types.js';
import { mitreKnowledgebaseTool } from '../tools/agentTools.js';

export interface MitreMappingResult {
  techniques: MitreTechnique[];
  tacticsCovered: string[];
  summary: string;
  toolsUsed: string[];
}

export class MitreAttackAgent {
  name = 'MITRE ATT&CK Agent';
  role = 'Attribution and mapping to the MITRE ATT&CK Enterprise Matrix framework';
  tools = [mitreKnowledgebaseTool.name];

  async mapToMatrix(incidentId: string, threatFindings: ThreatFinding[]): Promise<MitreMappingResult> {
    const techniques: MitreTechnique[] = [];
    const addedIds = new Set<string>();

    for (const finding of threatFindings) {
      // Invoke Tool: mitre_knowledgebase_tool
      const queryResult = mitreKnowledgebaseTool.execute({ threatCategory: finding.threat_category });

      for (const t of queryResult.matchedTechniques) {
        if (!addedIds.has(t.id)) {
          addedIds.add(t.id);
          techniques.push({
            id: uuidv4(),
            incident_id: incidentId,
            technique_id: t.id,
            technique_name: t.name,
            tactic: t.tactic,
            url: t.url,
            relevance_note: `Attributed from finding: ${finding.threat_category}`
          });
        }
      }
    }

    const tactics = Array.from(new Set(techniques.map((t) => t.tactic)));

    return {
      techniques,
      tacticsCovered: tactics,
      summary: `Mapped incident to ${techniques.length} MITRE ATT&CK techniques using tool [${mitreKnowledgebaseTool.name}].`,
      toolsUsed: [mitreKnowledgebaseTool.name]
    };
  }
}

export const mitreAttackAgent = new MitreAttackAgent();
