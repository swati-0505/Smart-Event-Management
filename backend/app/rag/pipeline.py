from pathlib import Path
from app.rag.loader import load_pdf
from app.rag.chunker import chunk_text
from app.rag.embeddings import create_embeddings
from app.rag.database import insert_chunk

def process_document(file_path):
    # Step 1: Load PDF
    text, document_id = load_pdf(file_path)

    # Step 2: Split text into chunks
    chunks = chunk_text(text)

    # Step 3: Create embeddings
    embeddings = create_embeddings(chunks)

    # Step 4: Store chunks and embeddings
    
    for chunk, embedding in zip(chunks, embeddings):
        insert_chunk(
        chunk,
        embedding,
        file_path.name,
        document_id,
    )
    return len(chunks)

def process_all_documents(documents_path):
    pdf_files = documents_path.glob("*.pdf")

    total_chunks = 0

    for pdf_file in pdf_files:

        # Skip the temporary test PDF
        if pdf_file.name == "test_policy.pdf":
            continue

        print(f"Processing: {pdf_file.name}")

        count = process_document(pdf_file)

        print(f"Created {count} chunks from {pdf_file.name}")

        total_chunks += count

    return total_chunks

if __name__ == "__main__":
    documents_path = (
        Path(__file__).resolve().parents[2]
        / "documents"
    )

    total = process_all_documents(documents_path)

    print(f"Processed {total} chunks successfully.")