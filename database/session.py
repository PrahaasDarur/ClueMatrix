from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# IMPORTANT: Update this connection string to match your actual PostgreSQL setup!
DATABASE_URL = "postgresql://user:password@localhost/evidence_db" 

# 1. Create the engine (connection to the DB)
engine = create_engine(DATABASE_URL)

# 2. Create the SessionLocal factory (This is the callable object)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine) 

