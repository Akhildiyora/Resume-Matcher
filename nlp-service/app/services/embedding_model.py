from sentence_transformers import SentenceTransformer
import numpy as np

# Load once at boot and reuse.
model = SentenceTransformer("all-MiniLM-L6-v2")


def get_embedding(text: str) -> np.ndarray:
    return model.encode(text)


def get_embeddings(texts: list[str]):
    return model.encode(texts, batch_size=32)


def normalize(vec: np.ndarray) -> np.ndarray:
    norm = np.linalg.norm(vec)
    if norm == 0:
        return vec
    return vec / norm
