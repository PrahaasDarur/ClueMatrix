from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship, declarative_base

from database.session import engine

Base = declarative_base()


class EvidenceFile(Base):
    """Stores metadata about the original uploaded file."""

    __tablename__ = "evidence_files"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    storage_path = Column(String, nullable=False)  # Path to file in S3/Cloud Storage
    file_type = Column(String, nullable=False)  # e.g., 'image', 'pdf', 'chat_export'
    upload_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="RECEIVED")  # e.g., RECEIVED, PROCESSING, COMPLETE, FAILED

    entities = relationship("ExtractedEntity", back_populates="evidence_file")
    timeline = relationship("IncidentTimeline", back_populates="evidence_file")


class ExtractedEntity(Base):
    """Stores specific entities extracted by NLP/OCR."""

    __tablename__ = "extracted_entities"

    id = Column(Integer, primary_key=True, index=True)
    evidence_file_id = Column(String, ForeignKey("evidence_files.id"), nullable=False)
    entity_type = Column(String, nullable=False)  # e.g., 'PERSON', 'DATE', 'LOCATION', 'KEYWORD'
    value = Column(String, nullable=False)  # The actual extracted value
    context = Column(String)  # The surrounding text snippet where it was found

    evidence_file = relationship("EvidenceFile", back_populates="entities")
    source_relationships = relationship(
        "Relationships",
        foreign_keys="[Relationships.source_entity_id]",
        back_populates="source_entity",
    )
    target_relationships = relationship(
        "Relationships",
        foreign_keys="[Relationships.target_entity_id]",
        back_populates="target_entity",
    )


class Relationships(Base):
    """Models the connections between entities."""

    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, index=True)
    source_entity_id = Column(Integer, ForeignKey("extracted_entities.id"), nullable=False)
    target_entity_id = Column(Integer, ForeignKey("extracted_entities.id"), nullable=False)
    relationship_type = Column(String, nullable=False)  # e.g., 'COMMUNICATED_WITH'
    confidence_score = Column(Integer)  # Score from the NLP model (0-100)

    source_entity = relationship(
        "ExtractedEntity",
        foreign_keys=[source_entity_id],
        back_populates="source_relationships",
    )
    target_entity = relationship(
        "ExtractedEntity",
        foreign_keys=[target_entity_id],
        back_populates="target_relationships",
    )


class IncidentTimeline(Base):
    """Placeholder timeline model for related evidence events."""

    __tablename__ = "incident_timeline"

    id = Column(Integer, primary_key=True, index=True)
    evidence_file_id = Column(String, ForeignKey("evidence_files.id"), nullable=False)
    event_description = Column(String, nullable=False)
    event_time = Column(DateTime, default=datetime.utcnow)

    evidence_file = relationship("EvidenceFile", back_populates="timeline")


def init_db():
    """Creates all tables in the database."""
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully.")
