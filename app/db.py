import sqlite3
import os
from pathlib import Path
from app.config import settings

def get_conn():
    # Use /tmp for serverless environments (Vercel)
    if os.environ.get('VERCEL'):
        db_path = Path("/tmp/phishguard.sqlite3")
    else:
        db_path = Path(settings.DB_PATH)
    db_path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(db_path.as_posix(), check_same_thread=False)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_conn()
    cur = conn.cursor()
    cur.execute("""
    CREATE TABLE IF NOT EXISTS analysis_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        input_type TEXT NOT NULL,              -- 'email' or 'url' or 'combined'
        email_text TEXT,
        url TEXT,
        label TEXT NOT NULL,                   -- Safe / Suspicious / Phishing
        confidence REAL NOT NULL,              -- 0..1
        explanation TEXT NOT NULL,
        client_ip TEXT,
        user_agent TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    """)
    conn.commit()
    conn.close()
