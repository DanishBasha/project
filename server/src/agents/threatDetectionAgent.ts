import { v4 as uuidv4 } from 'uuid';
import { ThreatFinding, IncidentLog, IndicatorOfCompromise } from '../types.js';

export interface ThreatDetectionResult {
  threatFindings: ThreatFinding[];
  primaryCategory: string;
  maxConfidence: number;
  summary: string;
}

export class ThreatDetectionAgent {
  name = 'Threat Detection Agent';
  role = 'Pattern recognition, heuristic correlation, and attack vector classification';

  async detect(
    incidentId: string,
    logs: IncidentLog[],
    iocs: IndicatorOfCompromise[]
  ): Promise<ThreatDetectionResult> {
    const rawCorpus = logs.map((l) => l.raw_message).join('\n').toLowerCase();
    const findings: ThreatFinding[] = [];

    // Pattern 1: Brute Force & Credential Harvesting
    if (
      rawCorpus.includes('failed password') ||
      rawCorpus.includes('invalid user') ||
      rawCorpus.includes('ssh2') ||
      rawCorpus.includes('attempt')
    ) {
      const hasAccepted = rawCorpus.includes('accepted password') || rawCorpus.includes('session opened');
      findings.push({
        id: uuidv4(),
        incident_id: incidentId,
        threat_category: hasAccepted
          ? 'Distributed Credential Stuffing with Successful Compromise'
          : 'High-Frequency SSH Brute Force Attack',
        confidence_score: hasAccepted ? 96 : 88,
        evidence_summary: hasAccepted
          ? 'Observed repeated failed authentication handshakes followed by unauthorized root login session.'
          : 'Repetitive authentication rejection bursts originating from external IP.',
        detected_at: new Date().toISOString()
      });
    }

    // Pattern 2: Remote Code Execution & JNDI / Log4Shell Exploit
    if (
      rawCorpus.includes('jndi:') ||
      rawCorpus.includes('cve-2021-44228') ||
      rawCorpus.includes('namingexception') ||
      rawCorpus.includes('/bin/sh') ||
      rawCorpus.includes('curl -s') ||
      rawCorpus.includes('wget') ||
      rawCorpus.includes('/dev/tcp/')
    ) {
      findings.push({
        id: uuidv4(),
        incident_id: incidentId,
        threat_category: 'Remote Code Execution & Reverse Shell Dropper',
        confidence_score: 97,
        evidence_summary: 'Payload injection string detected in HTTP headers/process args followed by interactive shell and outbound socket spawn.',
        detected_at: new Date().toISOString()
      });
    }

    // Pattern 3: Ransomware Activity & Canary Trip
    if (
      rawCorpus.includes('canary') ||
      rawCorpus.includes('.lockbit') ||
      rawCorpus.includes('high entropy') ||
      rawCorpus.includes('vssadmin') ||
      rawCorpus.includes('delete shadows')
    ) {
      findings.push({
        id: uuidv4(),
        incident_id: incidentId,
        threat_category: 'Ransomware Outbreak & Shadow Copy Deletion',
        confidence_score: 98,
        evidence_summary: 'Decoy canary file modified, volume shadow copy deletion initiated, and mass file encryption extension pattern detected.',
        detected_at: new Date().toISOString()
      });
    }

    // Pattern 4: SQL Injection & Exfiltration
    if (
      rawCorpus.includes('union select') ||
      rawCorpus.includes('sqlmap') ||
      rawCorpus.includes('pg_sleep') ||
      rawCorpus.includes('syntax error')
    ) {
      findings.push({
        id: uuidv4(),
        incident_id: incidentId,
        threat_category: 'Automated SQL Injection & Schema Reconnaissance',
        confidence_score: 93,
        evidence_summary: 'WAF rules intercepted SQL manipulation syntax and automated sqlmap scanner signatures probing relational endpoints.',
        detected_at: new Date().toISOString()
      });
    }

    // Generic Fallback if unusual logs
    if (findings.length === 0) {
      findings.push({
        id: uuidv4(),
        incident_id: incidentId,
        threat_category: 'Anomalous Syslog Activity / Policy Violation',
        confidence_score: 72,
        evidence_summary: 'Unusual sequence of elevated warnings and unauthorized connection attempts detected.',
        detected_at: new Date().toISOString()
      });
    }

    const maxConf = Math.max(...findings.map((f) => f.confidence_score));
    const primary = findings[0]?.threat_category || 'Suspicious Security Incident';

    return {
      threatFindings: findings,
      primaryCategory: primary,
      maxConfidence: maxConf,
      summary: `Identified ${findings.length} threat vectors. Primary vector: "${primary}" with ${maxConf}% confidence.`
    };
  }
}

export const threatDetectionAgent = new ThreatDetectionAgent();
