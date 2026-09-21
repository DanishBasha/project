# Google Form Submission Guide

This file contains the exact text and links to paste into your college submission form.

---

### Field 1: Problem Statement
```text
Modern organizations generate vast volumes of telemetry and security logs across endpoints, firewalls, and servers, making manual incident triage and investigation slow, fragmented, and vulnerable to analyst fatigue. This project proposes an AI-Powered Cybersecurity Incident Response Platform utilizing a Multi-Agent Super-Agent architecture. A central Super Agent coordinates six specialized AI agents for automated log analysis, indicator-of-compromise (IOC) extraction, anomaly & threat detection, MITRE ATT&CK technique mapping, business risk assessment, and actionable mitigation playbook generation. The platform leverages Supabase as an online PostgreSQL database for incident state persistence, real-time agent execution tracing, and compliance reporting.
```

---

### Field 2: GitHub Link
```text
https://github.com/YOUR_USERNAME/ai-cybersecurity-incident-response
```
*(Replace `YOUR_USERNAME` with your GitHub username once you push the repository.)*

**Steps to push to GitHub:**
```bash
git init
git add .
git commit -m "Initial commit: AI Cybersecurity Incident Response Super-Agent"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-cybersecurity-incident-response.git
git push -u origin main
```

---

### Field 3: System Architect Link
Use **draw.io / diagrams.net**:
1. Open [https://app.diagrams.net/](https://app.diagrams.net/)
2. Click **File -> Open From -> Device** and choose [`system_architecture.drawio.xml`](./system_architecture.drawio.xml) located in this folder.
3. Click **File -> Publish -> Link...** or save it to Google Drive / OneDrive and generate a "Anyone with link can view" link.
4. Paste that shareable link into the form:
```text
https://viewer.diagrams.net/?highlight=0000ff&edit=_blank&layers=1&nav=1&title=ai-incident-response-architecture#...
```

---

### Field 4: DB Link
Your Supabase Project Dashboard URL:
```text
https://eknahpoxbtzdbbpepldc.supabase.co
```
*(Or your Supabase dashboard link: `https://supabase.com/dashboard/project/eknahpoxbtzdbbpepldc`)*

> [!WARNING]
> Do NOT share your `service_role` secret key anywhere in this form or publicly on GitHub. Only share the project URL or public anon key if requested.

---

### Field 5: Comments
```text
The system implements a hierarchical Super-Agent multi-agent workflow where specialized agents collaborate dynamically throughout the cyber incident triage lifecycle. The system incorporates 8 formal Agent Tools: (1) log_parser_tool, (2) ioc_extractor_tool, (3) ioc_defanger_tool, (4) threat_intel_scorer_tool, (5) mitre_knowledgebase_tool, (6) blast_radius_evaluator_tool, (7) containment_cli_generator_tool, and (8) supabase_audit_logger_tool. An 'agent_executions' audit table provides complete transparency and real-time execution tracing for professors and SOC analysts. Supabase is utilized for online PostgreSQL persistence, authentication, and structured incident forensics.
```
