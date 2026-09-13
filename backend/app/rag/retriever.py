from sqlalchemy import create_engine, MetaData, Table, Column, Integer, Text, select
from sqlalchemy.dialects.postgresql import UUID
from pgvector.sqlalchemy import Vector

DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5433/eventdb"

engine = create_engine(DATABASE_URL)

metadata = MetaData()

knowledge_chunks = Table(
    "knowledge_chunks",
    metadata,
    Column("id", Integer, primary_key=True),
    Column("content", Text, nullable=False),
    Column("source_document", Text),
    Column("document_id", UUID(as_uuid=True)),
    Column("embedding", Vector(384)),
)

def search_similar(query_embedding, top_k=3):
    with engine.connect() as connection:
        statement = (
            select(
                knowledge_chunks.c.id,
                knowledge_chunks.c.content,
                knowledge_chunks.c.source_document,
                knowledge_chunks.c.document_id,
            )
            .order_by(
                knowledge_chunks.c.embedding.cosine_distance(query_embedding)
            )
            .limit(top_k)
        )
        
        results = connection.execute(statement)

        return [
            {
                "id": row.id,
                "content": row.content,
                "source_document": row.source_document,
                "document_id": row.document_id,
            }
            for row in results
        ]