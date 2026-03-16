interface AnalysisResult {
  label: "Safe" | "Suspicious" | "Phishing";
  confidence: number;
  reasons: string[];
}

const PHISH_PATTERNS: [RegExp, string][] = [
  [/\burgent\b|\bimmediately\b|\bact now\b/i, "لغة استعجال/ضغط على المستخدم."],
  [/\bverify\b|\bconfirm\b|\bupdate\b.*\baccount\b/i, "طلب تحقق/تحديث حساب."],
  [/\bpassword\b|\bOTP\b|\bone[- ]time\b|\bcode\b/i, "ذكر كلمات مرور/رموز تحقق."],
  [/\bbank\b|\bpayment\b|\binvoice\b|\brefund\b/i, "مصطلحات مالية تستعمل كثيرًا في التصيّد."],
  [/http[s]?:\/\//i, "وجود روابط داخل البريد (ليس دائمًا سيئًا لكنه مؤشر)."],
];

const AR_PHISH_HINTS: [string, string][] = [
  ["عاجل", "لغة استعجال."],
  ["تحقق", "طلب تحقق/تأكيد."],
  ["تحديث بيانات", "طلب تحديث بيانات."],
  ["كلمة المرور", "طلب بيانات حساسة."],
  ["رمز", "ذكر رمز/OTP."],
];

export function scoreEmail(text: string): AnalysisResult {
  const t = (text || "").trim();
  const low = t.toLowerCase();
  const reasons: string[] = [];
  let score = 0.0;

  // English-like regex patterns
  for (const [pattern, why] of PHISH_PATTERNS) {
    if (pattern.test(low)) {
      score += 0.12;
      reasons.push(why);
    }
  }

  // Arabic hints
  for (const [word, why] of AR_PHISH_HINTS) {
    if (t.includes(word)) {
      score += 0.1;
      reasons.push(why);
    }
  }

  // Too many exclamation marks
  const exclamationCount = (t.match(/!/g) || []).length;
  if (exclamationCount >= 3) {
    score += 0.08;
    reasons.push("استخدام مفرط لعلامات التعجب.");
  }

  // ALL CAPS words
  const capsWords = t.match(/\b[A-Z]{5,}\b/g) || [];
  if (capsWords.length >= 2) {
    score += 0.08;
    reasons.push("كلمات كثيرة بحروف كبيرة (أسلوب تهديد/ضغط).");
  }

  // Requests for personal info
  const sensitiveKeywords = ["id number", "credit card", "cvv", "ssn"];
  if (sensitiveKeywords.some((k) => low.includes(k))) {
    score += 0.2;
    reasons.push("طلب معلومات شخصية/مالية حساسة.");
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
