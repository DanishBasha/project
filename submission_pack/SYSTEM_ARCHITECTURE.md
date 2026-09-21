# System Architecture Documentation: AI Cybersecurity Incident Response Super-Agent

## Executive Summary
In modern enterprise Security Operations Centers (SOCs), analysts are overwhelmed by alert fatigue from disparate firewalls, endpoint detection systems (EDR), and identity access providers. 

This platform replaces fragmented, manual investigation workflows with a **Hierarchical Multi-Agent Super-Agent Architecture**. Rather than using a single generic LLM call or independent disconnected tools, a central **Super Agent** dynamically manages, reasons through, and orchestrates six specialized domain agents to triage incidents from raw telemetry all the way to mitigation playbooks.

---

## The Super-Agent Orchestration Flow

```text
               +----------------------------------+
               |  SECURITY LOGS / RAW TELEMETRY   |
               +-----------------+----------------+
                                 |
                                 v
               +----------------------------------+
               |      SUPER AGENT ORCHESTRATOR    |
               |                                  |
               |  • Dynamically schedules tasks   |
               |  • Context accumulator           |
               |  • Records step execution trace  |
               +-----------------+----------------+
                                 |
         +-----------------------+-----------------------+
         |                                               |
         v                                               v
+-------------------+                           +-------------------+
|  1. LOG ANALYSIS  |                           |  2. IOC EXTRACT   |
|      AGENT        |                           |       AGENT       |
| • Parse syslog/auth|                           | • IP addresses    |
| • Filter noise    |                           | • Domains / URLs  |
| • Sequence events |                           | • Hashes, accounts|
+--------+----------+                           +--------+----------+
         |                                               |
         +-----------------------+-----------------------+
                                 |
                                 v
               +----------------------------------+
               |    3. THREAT DETECTION AGENT     |
               |                                  |
               | • Behavioral pattern analysis    |
               | • Attack vector classification   |
               | • Confidence scoring (0-100%)    |
               +-----------------+----------------+
                                 |
                                 v
               +----------------------------------+
               |     4. MITRE ATT&CK AGENT        |
               |                                  |
               | • Maps to Tactics & Techniques   |
               | • Assigns T-Codes (e.g. T1110)   |
               | • Sub-technique precision        |
               +-----------------+----------------+
                                 |
                                 v
               +----------------------------------+
               |      5. RISK ANALYSIS AGENT      |
               |                                  |
               | • Calculates severity (P1 - P4)  |
               | • Assesses blast radius & assets |
               | • Evaluates compliance impact    |
               +-----------------+----------------+
                                 |
                                 v
               +----------------------------------+
               |      6. RESPONSE AGENT           |
               |                                  |
               | • Prescribes containment steps   |
               | • Generates CLI firewall scripts |
               | • Eradication & recovery actions |
               +-----------------+----------------+
                                 |
                                 v
               +----------------------------------+
               |     SUPABASE POSTGRESQL LAYER    |
               |                                  |
               | • Incident & Findings Tables     |
               | • agent_executions (Audit Trail) |
               +-----------------+----------------+
                                 |
                                 v
               +----------------------------------+
               |  REACT SOC ANALYST DASHBOARD     |
               +----------------------------------+
```

---

## Specialized Agent Breakdown

### Agent 1: Log Analysis Agent
- **Input**: Raw text logs from firewalls, syslog, auth.log, cloud trails, or application audits.
- **Function**: Standardizes timestamps, extracts normalized event records, flags anomalous spikes in error/warning codes, and reconstructs the sequential timeline.
- **Output**: Normalized event JSON with event counts and anomalies flagged.

### Agent 2: Indicator of Compromise (IOC) Agent
- **Input**: Normalized event stream.
- **Function**: Applies regex patterns and entity recognition to isolate IPv4/IPv6 addresses, domains, URLs, cryptographic hashes (MD5, SHA-1, SHA-256), and targeted system user accounts. Automatically generates **defanged** strings (e.g., `198[.]51[.]100[.]42`) to prevent accidental clicks.
- **Output**: Typed list of IOCs with reputation and threat intelligence severity.

### Agent 3: Threat Detection Agent
- **Input**: Parsed logs + extracted IOCs.
- **Function**: Correlates events over time windows to distinguish between benign noise and active cyber threats (e.g. Brute Force, Credential Stuffing, SQL Injection, Web Shell Dropper, Ransomware Encryption).
- **Output**: Primary attack vector, confidence score (0–100%), and evidence breakdown.

### Agent 4: MITRE ATT&CK Mapping Agent
- **Input**: Threat classification and attack characteristics.
- **Function**: Maps the detected threat to the standardized **MITRE ATT&CK Enterprise Matrix**, identifying the specific Tactic (Initial Access, Credential Access, Execution, etc.) and Technique ID (e.g., `T1110.001`, `T1078.003`).
- **Output**: Array of MITRE techniques with official URLs and context notes.

### Agent 5: Risk & Impact Analysis Agent
- **Input**: Threat findings, affected systems, and MITRE mapping.
- **Function**: Evaluates the organizational severity level (`LOW`, `MEDIUM`, `HIGH`, `CRITICAL`), estimates the blast radius (local host vs. VPC segment vs. corporate domain), and identifies regulatory/compliance concerns (e.g. PCI-DSS, SOC 2, HIPAA).
- **Output**: Quantitative risk score (0–100), blast radius assessment, and compliance impact list.

### Agent 6: Response & Remediation Playbook Agent
- **Input**: Full incident dossier (IOCs, risk level, threat type).
- **Function**: Generates prioritized mitigation actions divided into Containment, Eradication, and Recovery. Includes safe, executable command snippets (e.g. `iptables`, `aws ec2`, PowerShell) for human SOC analysts to review and execute.
- **Output**: Prioritized action checklist with commands and status flags.

---

## Why a Super-Agent Multi-Agent Architecture?

When professors ask: *"Why didn't you just build one monolithic LLM prompt?"*
1. **Separation of Concerns**: Log parsing requires deterministic parsing and pattern extraction, whereas MITRE mapping requires specialized knowledge graph lookup, and risk calculation requires policy evaluation.
2. **Context Efficiency**: A single prompt cannot maintain state, token budgets, and granular error handling across large log dumps.
3. **Execution Transparency (`agent_executions` table)**: Every agent logs its exact input, output, and latency into the database. If the threat detection agent has low confidence, the Super Agent can trigger targeted secondary checks.
4. **Human-in-the-Loop Safety**: The Super Agent ensures that destructive response actions (like blocking IPs or terminating processes) are formulated as recommendations for analyst confirmation rather than autonomous unvetted execution.
