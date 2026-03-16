interface AnalysisResult {
  label: "Safe" | "Suspicious" | "Phishing";
  confidence: number;
  reasons: string[];
}

const SUSPICIOUS_TLDS = new Set([
  "zip",
  "mov",
  "click",
  "top",
  "xyz",
  "tk",
  "gq",
  "cf",
]);
const SUSPICIOUS_WORDS = new Set([
  "login",
  "verify",
  "update",
  "secure",
  "account",
  "bank",
  "password",
  "confirm",
]);

interface UrlFeatures {
  lenUrl: number;
  countDots: number;
  countHyphen: number;
  hasAt: boolean;
  hasIp: boolean;
  hasHttps: boolean;
  hasHttp: boolean;
  suspiciousWords: number;
  tldSuspicious: boolean;
  manySubdomains: boolean;
  containsPunycode: boolean;
}

function extractUrlFeatures(url: string): UrlFeatures {
  let parsed: URL;
  try {
    parsed = new URL(url.trim());
  } catch {
    // If URL is invalid, try adding https://
    try {
      parsed = new URL("https://" + url.trim());
    } catch {
      return {
        lenUrl: url.length,
        countDots: (url.match(/\./g) || []).length,
        countHyphen: (url.match(/-/g) || []).length,
        hasAt: url.includes("@"),
        hasIp: false,
        hasHttps: false,
        hasHttp: false,
        suspiciousWords: 0,
        tldSuspicious: false,
        manySubdomains: false,
        containsPunycode: false,
      };
    }
  }

  const host = parsed.hostname.toLowerCase();
  const path = (parsed.pathname || "").toLowerCase();
  const full = (host + path).toLowerCase();

  const tld = host.split(".").pop() || "";

  return {
    lenUrl: url.length,
    countDots: (url.match(/\./g) || []).length,
    countHyphen: (url.match(/-/g) || []).length,
    hasAt: url.includes("@"),
    hasIp: /(?:\d{1,3}\.){3}\d{1,3}/.test(host),
    hasHttps: parsed.protocol === "https:",
    hasHttp: parsed.protocol === "http:",
    suspiciousWords: Array.from(SUSPICIOUS_WORDS).filter((w) =>
      full.includes(w)
    ).length,
    tldSuspicious: SUSPICIOUS_TLDS.has(tld),
    manySubdomains: (host.match(/\./g) || []).length >= 3,
    containsPunycode: host.includes("xn--"),
  };
}

export function scoreUrl(url: string): AnalysisResult {
  const f = extractUrlFeatures(url);
  const reasons: string[] = [];
  let score = 0.0;

  if (f.hasAt) {
    score += 0.25;
    reasons.push("وجود @ داخل الرابط (خدعة شائعة لإخفاء الدومين الحقيقي).");
  }

  if (f.hasIp) {
    score += 0.25;
    reasons.push("الرابط يستخدم IP بدل دومين (مريب).");
  }

  if (f.hasHttp) {
    score += 0.1;
    reasons.push("الرابط HTTP بدون تشفير HTTPS.");
  }

  if (f.tldSuspicious) {
    score += 0.15;
    reasons.push("امتداد دومين مريب (TLD غير شائع للتعاملات الرسمية).");
  }

  if (f.manySubdomains) {
    score += 0.1;
    reasons.push("عدد كبير من الـ subdomains (قد يكون تقليدًا لدومين معروف).");
  }

  if (f.containsPunycode) {
    score += 0.15;
    reasons.push("وجود Punycode xn-- (قد يستخدم لتزوير أسماء مواقع).");
  }

  if (f.lenUrl > 120) {
    score += 0.1;
    reasons.push("طول الرابط كبير جدًا.");
  }

  if (f.suspiciousWords >= 2) {
    score += 0.15;
    reasons.push("وجود كلمات مرتبطة بتسجيل الدخول/التحقق بكثرة داخل الرابط.");
  }

  score = Math.min(score, 0.99);

  if (score >= 0.65) {
    return { label: "Phishing", confidence: score, reasons };
  }
  if (score >= 0.35) {
    return { label: "Suspicious", confidence: score, reasons };
  }
  return { label: "Safe", confidence: Math.max(0.05, score), reasons };
}
