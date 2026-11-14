import os

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker


def _build_database_url() -> str:
    """Use the configured database URL when available; otherwise default to SQLite."""
    configured_url = os.getenv("DATABASE_URL")
    if configured_url:
        return configured_url

    base_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    db_path = os.path.join(base_dir, "evidence.db")
    return f"sqlite:///{db_path}"


DATABASE_URL = _build_database_url()

try:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
except ModuleNotFoundError:
    if DATABASE_URL.startswith("postgresql"):
        sqlite_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "evidence.db"))
        DATABASE_URL = f"sqlite:///{sqlite_path}"
        engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
    else:
        raise

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
