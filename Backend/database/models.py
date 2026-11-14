from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class EvidenceFile(Base):
    """Stores metadata about the original uploaded file."""
    __tablename__ = "evidence_files"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    storage_path = Column(String, nullable=False)       # Path to file in S3/Cloud Storage
    file_type = Column(String, nullable=False)          # e.g., 'image', 'pdf', 'chat_export'
    upload_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="RECEIVED")         # e.g., RECEIVED, PROCESSING, COMPLETE, FAILED

    entities = relationship("ExtractedEntity", back_populates="evidence_file")
    timeline = relationship("IncidentTimeline", back_populates="evidence_file")


class ExtractedEntity(Base):
    """Stores specific entities (Names, Dates, Locations) extracted by NLP/OCR."""
    __tablename__ = "extracted_entities"
    
    id = Column(Integer, primary_key=True, index=True)
    evidence_file_id = Column(Integer, ForeignKey("evidence_files.id"), nullable=False)
    entity_type = Column(String, nullable=False)         # e.g., 'PERSON', 'DATE', 'LOCATION', 'KEYWORD'
    value = Column(String, nullable=False)               # The actual extracted value
    context = Column(String)                             # The surrounding text snippet where it was found
    
    evidence_file = relationship("EvidenceFile", back_populates="entities")


class Relationships(Base):
    """Models the connections between entities (e.g., Person A communicated with Person B)."""
    __tablename__ = "relationships"
    
    id = Column(Integer, primary_key=True, index=True)
    source_entity_id = Column(Integer, ForeignKey("extracted_entities.id"), nullable=False)
    target_entity_id = Column(Integer, ForeignKey("extracted_entities.id"), nullable=False)
    relationship_type = Column(String, nullable=False)     # e.g., 'COMMUNICATED_WITH', 'ATTENDED_EVENT', 'MENTIONED'
    confidence_score = Column(Integer)                    # Score from the NLP model (0-100)
    
    source_entity = relationship("ExtractedEntity", foreign_keys=[source_entity_id], back_populates="relationships")
    target_entity = relationship("ExtractedEntity", foreign_keys=[target_entity_id], back_populates="relationships")

def init_db():
    """Creates all tables in the database."""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")
