from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()


class EvidenceFile(Base):
    __tablename__ = "evidence_files"

    id = Column(String(36), primary_key=True, index=True)
    user_id = Column(Integer, index=True, nullable=False)
    storage_path = Column(String, nullable=False)
    file_type = Column(String, nullable=False)
    upload_date = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="RECEIVED")

    entities = relationship(
        "ExtractedEntity",
        back_populates="evidence_file",
        cascade="all, delete-orphan",
    )


class ExtractedEntity(Base):
    __tablename__ = "extracted_entities"

    id = Column(Integer, primary_key=True, index=True)
    evidence_file_id = Column(String(36), ForeignKey("evidence_files.id"), nullable=False)
    entity_type = Column(String, nullable=False)
    value = Column(Text, nullable=False)
    context = Column(Text)
    start_offset = Column(Integer)
    end_offset = Column(Integer)
    page_number = Column(Integer, nullable=True)
    extraction_method = Column(String)

    evidence_file = relationship("EvidenceFile", back_populates="entities")
    outgoing_relationships = relationship(
        "Relationships",
        foreign_keys="Relationships.source_entity_id",
        back_populates="source_entity",
    )
    incoming_relationships = relationship(
        "Relationships",
        foreign_keys="Relationships.target_entity_id",
        back_populates="target_entity",
    )


class Relationships(Base):
    __tablename__ = "relationships"

    id = Column(Integer, primary_key=True, index=True)
    source_entity_id = Column(Integer, ForeignKey("extracted_entities.id"), nullable=False)
    target_entity_id = Column(Integer, ForeignKey("extracted_entities.id"), nullable=False)
    relationship_type = Column(String, nullable=False)
    confidence_score = Column(Integer)

    source_entity = relationship(
        "ExtractedEntity",
        foreign_keys=[source_entity_id],
        back_populates="outgoing_relationships",
    )
    target_entity = relationship(
        "ExtractedEntity",
        foreign_keys=[target_entity_id],
        back_populates="incoming_relationships",
    )
