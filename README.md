# 🛡️ AI Cybersecurity Incident Response Super-Agent

> **An Autonomous Multi-Agent SOC Command Center orchestrated by a central Super-Agent with online Supabase PostgreSQL persistence.**

---

## 📌 Project Overview
Modern Security Operations Centers (SOCs) face crippling alert fatigue from thousands of daily logs across endpoints, firewalls, and cloud infrastructure.

This platform replaces slow, manual triage with a **Multi-Agent Super-Agent Architecture**. A central **Super Agent** dynamically coordinates six specialized domain agents to ingest raw logs, extract IOCs, detect threats, map adversary tactics to the **MITRE ATT&CK Matrix**, evaluate organizational blast radius, and generate actionable containment playbooks.

---

## 🏛️ Super-Agent Architecture

```text
                    ┌─────────────────────────┐
                    │  SECURITY ANALYST / SOC │
                    │     Web Application     │
                    └────────────┬────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │    SUPER AGENT (SOC)    │
                    │   Central Orchestrator  │
                    │                         │
                    │ Dynamic Task Scheduling │
                    │ Inter-Agent Routing     │
                    │ Trace Audit Logging     │
                    └────────────┬────────────┘
                                 │
      ┌──────────────────────────┼──────────────────────────┐
      │                          │                          │
      ▼                          ▼                          ▼
┌───────────────┐        ┌───────────────┐          ┌───────────────┐
│ 1. Log Agent  │        │ 2. IOC Agent  │          │3. Threat Agent│
│               │        │               │          │               │
│ Parse & sort  │        │ Extract IPs,  │          │ Detect attack │
│ multi-source  │        │ hashes, URLs, │          │ patterns with │
│ syslogs       │        │ defang values │          │ confidence %  │
└───────┬───────┘        └───────┬───────┘          └───────┬───────┘
        │                        │                          │
        └────────────────────────┼──────────────────────────┘
                                 │
      ┌──────────────────────────┼──────────────────────────┐
      │                          │                          │
      ▼                          ▼                          ▼
┌───────────────┐        ┌───────────────┐          ┌───────────────┐
│4. MITRE Agent │        │5. Risk Agent  │          │6. Response    │
│               │        │               │          │   Agent       │
│ Technique IDs │        │ Blast radius  │          │ CLI scripts,  │
│ (T1110, T1078)│        │ & compliance  │          │ containment   │
└───────┬───────┘        └───────┬───────┘          └───────┬───────┘
        │                        │                          │
        └────────────────────────┼──────────────────────────┘
                                 │
                                 ▼
                    ┌─────────────────────────┐
                    │        SUPABASE         │
                    │   PostgreSQL Database   │
                    │                         │
                    │ security_incidents      │
                    │ incident_logs           │
                    │ indicators_of_compromise│
                    │ threat_findings         │
                    │ mitre_techniques        │
                    │ risk_assessments        │
                    │ response_recommendations│
                    │ agent_executions (Trace)│
                    └─────────────────────────┘
```

---

## 🤖 Specialized AI Agents

| # | Agent Name | Primary Responsibility | Key Output |
|---|---|---|---|
| **0** | **Super Agent** | Dynamic task planning, pipeline dispatch, state synthesis | Audit trace in `agent_executions` |
| **1** | **Log Analysis Agent** | Normalizes syslog, auth, firewall, and auditd logs | Event timeline & anomaly counts |
| **2** | **IOC Extraction Agent** | Identifies IPv4, domains, hashes (SHA-256), accounts | Defanged indicators & threat scores |
| **3** | **Threat Detection Agent** | Analyzes behavior & correlates attack patterns | Attack category & confidence (0-100%) |
| **4** | **MITRE ATT&CK Agent** | Maps incident to the MITRE ATT&CK framework | T-Codes (T1110, T1078, T1059, etc.) |
| **5** | **Risk Analysis Agent** | Computes organizational severity & blast radius | Severity (CRITICAL/HIGH), impact radius |
| **6** | **Response Playbook Agent** | Formulates containment & eradication actions | Actionable CLI command snippets |

---

## 🚀 Quick Start Guide

### Step 1: Install Dependencies
Open a terminal in the project root:
```bash
npm run install:all
```
*(Or install each separately: `cd server && npm install`, `cd client && npm install`)*

### Step 2: Start the Backend Server
```bash
npm run server
```
*The backend starts at `http://localhost:5000`.*

### Step 3: Start the Frontend Dashboard
In a second terminal:
```bash
npm run client
```
*The SOC Dashboard opens at `http://localhost:3000`.*

---

## 🗄️ Supabase Online Database Setup (Optional & Ready)
The platform includes an automatic zero-config **in-memory mock fallback**, meaning it works right out of the box even before configuring Supabase.

To connect your live Supabase PostgreSQL database:
1. Open [supabase.com](https://supabase.com) and create a free project.
2. Go to the **SQL Editor**, open [`supabase/schema.sql`](./supabase/schema.sql), and click **Run**.
3. Copy your **Project URL** and **Anon Key** from Project Settings -> API.
4. Add them into `server/.env`:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key-here
   ```
5. Restart `npm run server` — all incidents, logs, and agent traces will now persist to your live online database!

---

## 📋 College Submission Form Resources
Everything required for your Google Form submission is pre-packaged in the [`submission_pack/`](./submission_pack/) folder:
- **`submission_pack/GOOGLE_FORM_SUBMISSION.md`**: Complete copy-paste text for the 5 form fields:
  1. Problem Statement
  2. GitHub Link instructions
  3. System Architect Link (draw.io link instructions)
  4. DB Link (Supabase link instructions)
  5. Comments
- **`submission_pack/system_architecture.drawio.xml`**: Standalone architecture diagram ready to open/import directly into [draw.io](https://app.diagrams.net/).
- **`submission_pack/SYSTEM_ARCHITECTURE.md`**: Complete system architecture rationale and multi-agent defense answers.
