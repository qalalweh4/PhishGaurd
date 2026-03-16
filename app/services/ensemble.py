def combine(email_result, url_result):
    # each: (label, confidence, reasons)
    e_label, e_conf, e_reasons = email_result
    u_label, u_conf, u_reasons = url_result

    # Weighted fusion (email 55%, url 45%)
    p = 0.55 * e_conf + 0.45 * u_conf

    # If any model says phishing with strong confidence, push up
    if e_label == "Phishing" and e_conf >= 0.70:
        p = max(p, 0.80)
    if u_label == "Phishing" and u_conf >= 0.70:
        p = max(p, 0.80)

    # Decide label by thresholds
    if p >= 0.65:
        label = "Phishing"
    elif p >= 0.35:
        label = "Suspicious"
    else:
        label = "Safe"

    reasons = (e_reasons + u_reasons)[:8]
    return label, p, reasons
