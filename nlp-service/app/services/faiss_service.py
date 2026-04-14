import faiss
import numpy as np
import pickle
from pathlib import Path


def normalize(vectors: np.ndarray) -> np.ndarray:
    norms = np.linalg.norm(vectors, axis=1, keepdims=True)
    norms[norms == 0] = 1.0
    return vectors / norms


INDEX_PATH = Path("faiss.index")
IDS_PATH = Path("ids.pkl")


class FaissService:
    def __init__(self, dim: int):
        self.index = faiss.IndexFlatL2(dim)
        self.ids: list[int] = []

    def add(self, vectors: list[list[float]], ids: list[int]):
        matrix = np.array(vectors, dtype="float32")
        matrix = normalize(matrix)
        self.index.add(matrix)
        self.ids.extend(ids)

    def search(self, query: list[float], k: int = 5) -> list[int]:
        q = np.array([query], dtype="float32")
        q = normalize(q)
        _, indices = self.index.search(q, k)
        return [self.ids[i] for i in indices[0] if i >= 0]

    def save(self, index_path: Path = INDEX_PATH, ids_path: Path = IDS_PATH):
        faiss.write_index(self.index, str(index_path))
        with ids_path.open("wb") as stream:
            pickle.dump(self.ids, stream)

    def load(self, index_path: Path = INDEX_PATH, ids_path: Path = IDS_PATH):
        if index_path.exists():
            self.index = faiss.read_index(str(index_path))
        if ids_path.exists():
            with ids_path.open("rb") as stream:
                self.ids = pickle.load(stream)
