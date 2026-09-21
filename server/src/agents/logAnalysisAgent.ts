import { v4 as uuidv4 } from 'uuid';
import { IncidentLog } from '../types.js';
import { logParserTool } from '../tools/agentTools.js';

export interface LogAnalysisResult {
  parsedLogs: IncidentLog[];
  sourceDistribution: Record<string, number>;
  anomalousCount: number;
  timelineStart: string;
  timelineEnd: string;
  summary: string;
  toolsUsed: string[];
}

export class LogAnalysisAgent {
  name = 'Log Analysis Agent';
  role = 'Multi-source log ingestion, normalization, and temporal sequencing';
  tools = [logParserTool.name];

  async analyze(incidentId: string, rawLogContent: string): Promise<LogAnalysisResult> {
    // 1. Invoke Tool: log_parser_tool
    const toolOutput = logParserTool.execute({ rawLogs: rawLogContent });

    const parsedLogs: IncidentLog[] = [];
    const sourceDistribution: Record<string, number> = {};
    let anomalousCount = 0;

    for (const item of toolOutput) {
      sourceDistribution[item.source] = (sourceDistribution[item.source] || 0) + 1;
      if (item.level === 'ALERT' || item.level === 'WARN') {
        anomalousCount++;
      }

      parsedLogs.push({
        id: uuidv4(),
        incident_id: incidentId,
        source: item.source,
        log_level: item.level,
        timestamp: item.timestamp,
        raw_message: item.message,
        structured_data: {
          lineIndex: item.lineIndex,
          parsedByTool: logParserTool.name
        }
      });
    }

    const firstTime = parsedLogs[0]?.timestamp || new Date().toISOString();
    const lastTime = parsedLogs[parsedLogs.length - 1]?.timestamp || new Date().toISOString();

    return {
      parsedLogs,
      sourceDistribution,
      anomalousCount,
      timelineStart: firstTime,
      timelineEnd: lastTime,
      summary: `Parsed ${parsedLogs.length} events across ${Object.keys(sourceDistribution).length} log sources using tool [${logParserTool.name}].`,
      toolsUsed: [logParserTool.name]
    };
  }
}

export const logAnalysisAgent = new LogAnalysisAgent();
