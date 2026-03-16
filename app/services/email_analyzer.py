import re

PHISH_PATTERNS = [
    (r"\burgent\b|\bimmediately\b|\bact now\b", "لغة استعجال/ضغط على المستخدم."),
    (r"\bverify\b|\bconfirm\b|\bupdate\b.*\baccount\b", "طلب تحقق/تحديث حساب."),
    (r"\bpassword\b|\bOTP\b|\bone[- ]time\b|\bcode\b", "ذكر كلمات مرور/رموز تحقق."),
    (r"\bbank\b|\bpayment\b|\binvoice\b|\brefund\b", "مصطلحات مالية تستعمل كثيرًا في التصيّد."),
    (r"http[s]?://", "وجود روابط داخل البريد (ليس دائمًا سيئًا لكنه مؤشر)."),
]

AR_PHISH_HINTS = [
    ("عاجل", "لغة استعجال."),
    ("تحقق", "طلب تحقق/تأكيد."),
    ("تحديث بيانات", "طلب تحديث بيانات."),
    ("كلمة المرور", "طلب بيانات حساسة."),
    ("رمز", "ذكر رمز/OTP."),
]

def score_email(text: str) -> tuple[str, float, list[str]]:
    t = (text or "").strip()
    low = t.lower()
    reasons = []
    score = 0.0

    # English-like regex patterns
    for pat, why in PHISH_PATTERNS:
        if re.search(pat, low, flags=re.IGNORECASE):
            score += 0.12
            reasons.append(why)

    # Arabic hints
    for word, why in AR_PHISH_HINTS:
        if word in t:
            score += 0.10
            reasons.append(why)

    # Too many exclamation or ALL CAPS
    if sum(1 for c in t if c == "!") >= 3:
        score += 0.08; reasons.append("استخدام مفرط لعلامات التعجب.")
    if len(re.findall(r"\b[A-Z]{5,}\b", t)) >= 2:
        score += 0.08; reasons.append("كلمات كثيرة بحروف كبيرة (أسلوب تهديد/ضغط).")

    # Requests for personal info
    if any(k in low for k in ["id number", "credit card", "cvv", "ssn"]):
        score += 0.20; reasons.append("طلب معلومات شخصية/مالية حساسة.")

    score = min(score, 0.99)

    if score >= 0.65:
        return ("Phishing", score, reasons)
    if score >= 0.35:
        return ("Suspicious", score, reasons)
    return ("Safe", max(0.05, score), reasons)
