import re
from urllib.parse import urlparse

SUSPICIOUS_TLDS = {"zip", "mov", "click", "top", "xyz", "tk", "gq", "cf"}
SUSPICIOUS_WORDS = {"login", "verify", "update", "secure", "account", "bank", "password", "confirm"}

def extract_url_features(url: str) -> dict:
    parsed = urlparse(url.strip())
    host = parsed.netloc.lower()
    path = (parsed.path or "").lower()
    full = (host + path).lower()

    features = {}
    features["len_url"] = len(url)
    features["count_dots"] = url.count(".")
    features["count_hyphen"] = url.count("-")
    features["has_at"] = "@" in url
    features["has_ip"] = bool(re.search(r"(?:\d{1,3}\.){3}\d{1,3}", host))
    features["has_https"] = parsed.scheme.lower() == "https"
    features["has_http"] = parsed.scheme.lower() == "http"
    features["suspicious_words"] = sum(1 for w in SUSPICIOUS_WORDS if w in full)
    tld = host.split(".")[-1] if "." in host else ""
    features["tld_suspicious"] = tld in SUSPICIOUS_TLDS
    features["many_subdomains"] = host.count(".") >= 3
    features["contains_punycode"] = "xn--" in host
    return features

def score_url(url: str) -> tuple[str, float, list[str]]:
    f = extract_url_features(url)
    reasons = []
    score = 0.0

    if f["has_at"]:
        score += 0.25; reasons.append("وجود @ داخل الرابط (خدعة شائعة لإخفاء الدومين الحقيقي).")
    if f["has_ip"]:
        score += 0.25; reasons.append("الرابط يستخدم IP بدل دومين (مريب).")
    if f["has_http"]:
        score += 0.10; reasons.append("الرابط HTTP بدون تشفير HTTPS.")
    if f["tld_suspicious"]:
        score += 0.15; reasons.append("امتداد دومين مريب (TLD غير شائع للتعاملات الرسمية).")
    if f["many_subdomains"]:
        score += 0.10; reasons.append("عدد كبير من الـ subdomains (قد يكون تقليدًا لدومين معروف).")
    if f["contains_punycode"]:
        score += 0.15; reasons.append("وجود Punycode xn-- (قد يستخدم لتزوير أسماء مواقع).")

    if f["len_url"] > 120:
        score += 0.10; reasons.append("طول الرابط كبير جدًا.")
    if f["suspicious_words"] >= 2:
        score += 0.15; reasons.append("وجود كلمات مرتبطة بتسجيل الدخول/التحقق بكثرة داخل الرابط.")

    score = min(score, 0.99)

    if score >= 0.65:
        return ("Phishing", score, reasons)
    if score >= 0.35:
        return ("Suspicious", score, reasons)
    return ("Safe", max(0.05, score), reasons)
