import { v4 as uuidv4 } from 'uuid';
import { IndicatorOfCompromise, IncidentLog } from '../types.js';
import {
  iocExtractorTool,
  iocDefangerTool,
  threatIntelScorerTool
} from '../tools/agentTools.js';

export interface IocExtractionResult {
  iocs: IndicatorOfCompromise[];
  highRiskCount: number;
  uniqueIps: string[];
  uniqueDomains: string[];
  summary: string;
  toolsUsed: string[];
}

export class IocAgent {
  name = 'IOC Extraction Agent';
  role = 'Identification, validation, threat scoring, and defanging of cyber threat indicators';
  tools = [iocExtractorTool.name, iocDefangerTool.name, threatIntelScorerTool.name];

  async extract(incidentId: string, logs: IncidentLog[]): Promise<IocExtractionResult> {
    const rawCorpus = logs.map((l) => l.raw_message).join('\n');
    const iocs: IndicatorOfCompromise[] = [];
    const seenValues = new Set<string>();

    // 1. Invoke Tool: ioc_extractor_tool
    const extracted = iocExtractorTool.execute({ textCorpus: rawCorpus });

    // Process IPs
    for (const ip of extracted.ips) {
      if (seenValues.has(ip)) continue;
      seenValues.add(ip);

      // Tool: threat_intel_scorer_tool
      const scoreData = threatIntelScorerTool.execute({ indicatorValue: ip, indicatorType: 'IP' });
      // Tool: ioc_defanger_tool
      const defanged = iocDefangerTool.execute({ rawIndicator: ip });

      iocs.push({
        id: uuidv4(),
        incident_id: incidentId,
        ioc_type: 'IP',
        ioc_value: ip,
        threat_intel_score: scoreData.score,
        reputation: scoreData.reputation as any,
        defanged_value: defanged,
        extracted_at: new Date().toISOString()
      });
    }

    // Process URLs
    for (const url of extracted.urls) {
      if (seenValues.has(url)) continue;
      seenValues.add(url);
      const scoreData = threatIntelScorerTool.execute({ indicatorValue: url, indicatorType: 'URL' });
      const defanged = iocDefangerTool.execute({ rawIndicator: url });

      iocs.push({
        id: uuidv4(),
        incident_id: incidentId,
        ioc_type: 'URL',
        ioc_value: url,
        threat_intel_score: scoreData.score,
        reputation: scoreData.reputation as any,
        defanged_value: defanged,
        extracted_at: new Date().toISOString()
      });
    }

    // Process Domains
    for (const domain of extracted.domains) {
      const lower = domain.toLowerCase();
      if (seenValues.has(lower) || lower.endsWith('.local')) continue;
      seenValues.add(lower);
      const scoreData = threatIntelScorerTool.execute({ indicatorValue: lower, indicatorType: 'DOMAIN' });
      const defanged = iocDefangerTool.execute({ rawIndicator: lower });

      iocs.push({
        id: uuidv4(),
        incident_id: incidentId,
        ioc_type: 'DOMAIN',
        ioc_value: lower,
        threat_intel_score: scoreData.score,
        reputation: scoreData.reputation as any,
        defanged_value: defanged,
        extracted_at: new Date().toISOString()
      });
    }

    // Process Hashes
    for (const hash of extracted.hashes) {
      if (seenValues.has(hash)) continue;
      seenValues.add(hash);
      const scoreData = threatIntelScorerTool.execute({ indicatorValue: hash, indicatorType: 'HASH' });

      iocs.push({
        id: uuidv4(),
        incident_id: incidentId,
        ioc_type: 'HASH_SHA256',
        ioc_value: hash,
        threat_intel_score: scoreData.score,
        reputation: scoreData.reputation as any,
        defanged_value: hash,
        extracted_at: new Date().toISOString()
      });
    }

    // User Accounts
    const userMatches = rawCorpus.match(/(?:user|user=|username=|for invalid user|for root)\s+([a-zA-Z0-9_\-]+)/gi) || [];
    for (const match of userMatches) {
      const account = match.split(/\s+/).pop()?.replace(/["';,]/g, '');
      if (account && account.length > 1 && !seenValues.has(`user:${account}`)) {
        seenValues.add(`user:${account}`);
        iocs.push({
          id: uuidv4(),
          incident_id: incidentId,
          ioc_type: 'USER_ACCOUNT',
          ioc_value: account,
          threat_intel_score: account === 'root' || account === 'admin' ? 80 : 50,
          reputation: account === 'root' || account === 'admin' ? 'SUSPICIOUS' : 'BENIGN',
          defanged_value: account,
          extracted_at: new Date().toISOString()
        });
      }
    }

    const highRisk = iocs.filter((i) => i.threat_intel_score >= 80).length;
    const uniqueIps = iocs.filter((i) => i.ioc_type === 'IP').map((i) => i.ioc_value);
    const uniqueDomains = iocs.filter((i) => i.ioc_type === 'DOMAIN').map((i) => i.ioc_value);

    return {
      iocs,
      highRiskCount: highRisk,
      uniqueIps,
      uniqueDomains,
      summary: `Extracted ${iocs.length} IOCs using tools [${this.tools.join(', ')}].`,
      toolsUsed: this.tools
    };
  }
}

export const iocAgent = new IocAgent();
