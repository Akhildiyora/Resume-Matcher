import spacy

from app.services.parser import clean_text

nlp = spacy.load("en_core_web_sm")


def full_preprocess(text: str) -> dict[str, object]:
    cleaned = clean_text(text)
    doc = nlp(cleaned)

    tokens = [
        token.lemma_.lower()
        for token in doc
        if token.is_alpha and not token.is_stop
    ]

    processed_text = " ".join(tokens)

    return {
        "cleaned_text": cleaned,
        "processed_text": processed_text,
        "tokens": tokens,
        "token_count": len(tokens),
    }
