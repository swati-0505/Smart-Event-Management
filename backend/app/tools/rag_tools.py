from app.rag.embeddings import create_embeddings
from app.rag.retriever import search_similar

def search_event_policy(query):
    """
    Search event policy documents using semantic similarity.
    """

    query_embedding = create_embeddings([query])[0]

    results = search_similar(query_embedding, top_k=3)

    return results