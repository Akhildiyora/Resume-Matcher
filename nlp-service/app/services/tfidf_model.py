from sklearn.feature_extraction.text import TfidfVectorizer

# Keep a single vectorizer instance; fit on corpus before transforming new text.
vectorizer = TfidfVectorizer(max_features=5000)


def fit_tfidf(corpus: list[str]):
    """
    Fit the TF-IDF vectorizer on a list of documents.
    Returns the TF-IDF matrix for the fitted corpus.
    """
    return vectorizer.fit_transform(corpus)


def transform_text(text: str):
    """
    Transform a single document into the TF-IDF vector space learned in fit_tfidf.
    """
    return vectorizer.transform([text])
