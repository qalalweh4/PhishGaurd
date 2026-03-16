def build_explanation(label: str, confidence: float, reasons: list[str]) -> str:
    badge = {
        "Safe": "✅ آمن",
        "Suspicious": "⚠️ مريب",
        "Phishing": "🧨 تصيّد"
    }[label]

    reasons_txt = "\n".join([f"- {r}" for r in reasons]) if reasons else "- لا توجد مؤشرات قوية، النتيجة مبنية على نمط عام."
    return f"""{badge}
الثقة: {round(confidence*100, 1)}%

الأسباب:
{reasons_txt}

نصيحة سريعة:
- لا تضغط أي رابط قبل التحقق من الدومين الحقيقي.
- لا تشارك OTP أو كلمة مرور عبر الرسائل.
"""
