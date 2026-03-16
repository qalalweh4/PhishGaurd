interface AnalysisResult {
  label: "Safe" | "Suspicious" | "Phishing";
  confidence: number;
  reasons: string[];
}

export function combine(
  emailResult: AnalysisResult,
  urlResult: AnalysisResult
): AnalysisResult {
  const { label: eLabel, confidence: eConf, reasons: eReasons } = emailResult;
  const { label: uLabel, confidence: uConf, reasons: uReasons } = urlResult;

  // Weighted fusion (email 55%, url 45%)
  let p = 0.55 * eConf + 0.45 * uConf;

  // If any model says phishing with strong confidence, push up
  if (eLabel === "Phishing" && eConf >= 0.7) {
    p = Math.max(p, 0.8);
  }
  if (uLabel === "Phishing" && uConf >= 0.7) {
    p = Math.max(p, 0.8);
  }

  // Decide label by thresholds
  let label: "Safe" | "Suspicious" | "Phishing";
  if (p >= 0.65) {
    label = "Phishing";
  } else if (p >= 0.35) {
    label = "Suspicious";
  } else {
    label = "Safe";
  }

  const reasons = [...eReasons, ...uReasons].slice(0, 8);
  return { label, confidence: p, reasons };
}
