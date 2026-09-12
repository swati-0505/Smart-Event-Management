from sqlalchemy import create_engine, text
from pgvector.sqlalchemy import Vector

DATABASE_URL = "postgresql+psycopg://postgres:postgres@localhost:5433/eventdb"
engine = create_engine(DATABASE_URL)

def insert_chunk(content, embedding, source_document):
    with engine.connect() as connection:
        connection.execute(
            text("""
                INSERT INTO knowledge_chunks
                (content, embedding, source_document)
                VALUES (:content, :embedding, :source_document)
            """),
            {
                "content": content,
                "embedding": embedding,
                "source_document": source_document,
            },
        )
        connection.commit()