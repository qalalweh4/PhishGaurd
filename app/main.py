from fastapi import FastAPI, Request, Form
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates

from app.config import settings
from app.db import init_db, get_conn
from app.schemas import AnalyzeEmailRequest, AnalyzeUrlRequest, AnalyzeCombinedRequest
from app.services.email_analyzer import score_email
from app.services.url_analyzer import score_url
from app.services.ensemble import combine
from app.services.explain import build_explanation

app = FastAPI(title=settings.APP_NAME)
templates = Jinja2Templates(directory="app/templates")
app.mount("/static", StaticFiles(directory="app/static"), name="static")

@app.on_event("startup")
def startup():
    init_db()

def log_result(input_type, email_text, url, label, confidence, explanation, request: Request):
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
        INSERT INTO analysis_logs (input_type, email_text, url, label, confidence, explanation, client_ip, user_agent)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        input_type,
        email_text,
        url,
        label,
        confidence,
        explanation,
        request.client.host if request.client else None,
        request.headers.get("user-agent", None)
    ))
    conn.commit()
    conn.close()

@app.get("/", response_class=HTMLResponse)
def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/history", response_class=HTMLResponse)
def history(request: Request):
    conn = get_conn()
    rows = conn.execute("""
        SELECT id, input_type, label, confidence, created_at, substr(email_text,1,120) as email_preview, substr(url,1,120) as url_preview
        FROM analysis_logs
        ORDER BY id DESC
        LIMIT 200
    """).fetchall()
    conn.close()
    return templates.TemplateResponse("history.html", {"request": request, "rows": rows})

@app.post("/api/analyze-email")
def api_analyze_email(payload: AnalyzeEmailRequest, request: Request):
    label, conf, reasons = score_email(payload.text)
    explanation = build_explanation(label, conf, reasons)
    log_result("email", payload.text, None, label, conf, explanation, request)
    return {"label": label, "confidence": conf, "explanation": explanation}

@app.post("/api/analyze-url")
def api_analyze_url(payload: AnalyzeUrlRequest, request: Request):
    label, conf, reasons = score_url(payload.url)
    explanation = build_explanation(label, conf, reasons)
    log_result("url", None, payload.url, label, conf, explanation, request)
    return {"label": label, "confidence": conf, "explanation": explanation}

@app.post("/api/analyze")
def api_analyze_combined(payload: AnalyzeCombinedRequest, request: Request):
    email_text = payload.text or ""
    url = payload.url or ""

    # If only one provided, route to its analyzer
    if email_text and not url:
        label, conf, reasons = score_email(email_text)
    elif url and not email_text:
        label, conf, reasons = score_url(url)
    else:
        email_res = score_email(email_text)
        url_res = score_url(url)
        label, conf, reasons = combine(email_res, url_res)

    explanation = build_explanation(label, conf, reasons)
    log_result("combined", email_text if email_text else None, url if url else None, label, conf, explanation, request)
    return {"label": label, "confidence": conf, "explanation": explanation}
