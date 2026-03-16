from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "PhishGuard"
    DB_PATH: str = "data/phishguard.sqlite3"
    RESPONSE_TARGET_SECONDS: int = 5

settings = Settings()
