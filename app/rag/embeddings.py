from sentence_transformers import SentenceTransformer

MODEL_NAME = "all-MiniLM-L6-v2"

_model = SentenceTransformer(MODEL_NAME)


def embed_texts(texts):
    if not texts:
        return []

    embeddings = _model.encode(
        texts,
        normalize_embeddings=True,
    )

    return embeddings.tolist()


def embed_query(text):
    return embed_texts([text])[0]