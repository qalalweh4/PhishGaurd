type Label = "Safe" | "Suspicious" | "Phishing";

const BADGES: Record<Label, string> = {
  Safe: "آمن",
  Suspicious: "مريب",
  Phishing: "تصيّد",
};

export function buildExplanation(
  label: Label,
  confidence: number,
  reasons: string[]
): string {
  const badge = BADGES[label];

  const reasonsTxt =
    reasons.length > 0
      ? reasons.map((r) => `- ${r}`).join("\n")
      : "- لا توجد مؤشرات قوية، النتيجة مبنية على نمط عام.";

  return `${badge}
الثقة: ${Math.round(confidence * 100)}%

الأسباب:
${reasonsTxt}

نصيحة سريعة:
- لا تضغط أي رابط قبل التحقق من الدومين الحقيقي.
- لا تشارك OTP أو كلمة مرور عبر الرسائل.`;
}
