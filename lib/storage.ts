export interface AnalysisLog {
  id: number;
  inputType: "email" | "url" | "combined";
  emailText: string | null;
  url: string | null;
  label: "Safe" | "Suspicious" | "Phishing";
  confidence: number;
  explanation: string;
  clientIp: string | null;
  userAgent: string | null;
  createdAt: string;
}

// In-memory storage for serverless environment
// Note: This will reset on cold starts. For persistence, use a database.
const analysisLogs: AnalysisLog[] = [];
let nextId = 1;

export function addLog(
  log: Omit<AnalysisLog, "id" | "createdAt">
): AnalysisLog {
  const newLog: AnalysisLog = {
    ...log,
    id: nextId++,
    createdAt: new Date().toISOString(),
  };
  analysisLogs.unshift(newLog);
  
  // Keep only last 200 logs
  if (analysisLogs.length > 200) {
    analysisLogs.pop();
  }
  
  return newLog;
}

export function getLogs(limit = 200): AnalysisLog[] {
  return analysisLogs.slice(0, limit);
}

export function getStats() {
  const total = analysisLogs.length;
  const safe = analysisLogs.filter((l) => l.label === "Safe").length;
  const suspicious = analysisLogs.filter((l) => l.label === "Suspicious").length;
  const phishing = analysisLogs.filter((l) => l.label === "Phishing").length;
  
  return { total, safe, suspicious, phishing };
}
