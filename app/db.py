import sqlite3
import os
from pathlib import Path
from app.config import settings

# In serverless environments (Vercel), use in-memory SQLite
# For local development with Docker, use file-based SQLite
IS_SERVERLESS = os.environ.get("VERCEL", "") == "1" or os.environ.get("AWS_LAMBDA_FUNCTION_NAME", "")

# Global connection for in-memory database (to persist across requests in same instance)
_memory_conn = None

def get_conn():
    global _memory_conn
    
    if IS_SERVERLESS:
        # Use in-memory database for serverless
        if _memory_conn is None:
            _memory_conn = sqlite3.connect(":memory:", check_same_thread=False)
            _memory_conn.row_factory = sqlite3.Row
            _init_schema(_memory_conn)
        return _memory_conn
    else:
        # Use file-based database for local/Docker
        db_path = Path(settings.DB_PATH)
        db_path.parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(db_path.as_posix(), check_same_thread=False)
        conn.row_factory = sqlite3.Row
        return conn

def _init_schema(conn):
    """Initialize the database schema."""
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

def init_db():
    conn = get_conn()
    if not IS_SERVERLESS:
        _init_schema(conn)
        conn.close()
