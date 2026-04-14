import faiss
import numpy as np

# FAISS index configured for 384-dimensional vectors (MiniLM).
DIM = 384


def normalize(vecs: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vecs, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return vecs / norms


class FaissIndex:
    def __init__(self, dim: int = DIM):
        self.dim = dim
        self.index = faiss.IndexFlatL2(dim)
        self.job_ids = []

    def add(self, job_ids: list[int], embeddings: list[list[float]]):
        matrix = np.array(embeddings, dtype="float32")
        matrix = normalize(matrix)
        self.index.add(matrix)
        self.job_ids.extend(job_ids)

    def search(self, query_embedding: list[float], top_k: int = 5):
        query = np.array([query_embedding], dtype="float32")
        query = normalize(query)
        distances, indices = self.index.search(query, top_k)
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx < 0:
                continue
            results.append({
                "job_id": self.job_ids[idx],
                "distance": float(dist),
            })
        return results
