import re


def normalize_era(era: str | None) -> str | None:
    if not era:
        return None
    era_lower = era.lower()
    if "ancient" in era_lower:
        return "Ancient"
    if "medieval" in era_lower:
        return "Medieval"
    if "modern" in era_lower or "early modern" in era_lower:
        return "Modern"
    if "contemporary" in era_lower or "20th" in era_lower or "21st" in era_lower:
        return "Contemporary"
    if "enlightenment" in era_lower:
        return "Enlightenment"
    if "renaissance" in era_lower:
        return "Renaissance"
    return era.strip()


def clean_text(text: str | None) -> str | None:
    if not text:
        return None
    text = re.sub(r"\[\d+\]", "", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip() or None


def transform_record(raw: dict) -> dict | None:
    name = clean_text(raw.get("philosopher_name"))
    slug = raw.get("slug")
    intro = clean_text(raw.get("intro"))

    # Required fields — skip record if missing
    if not name or not slug or not intro:
        return None

    return {
        "philosopher_name": name,
        "slug": slug,
        "intro": intro,
        "birth": clean_text(raw.get("birth")),
        "death": clean_text(raw.get("death")),
        "era": normalize_era(raw.get("era")),
        "school": clean_text(raw.get("school")),
        "main_ideas": clean_text(raw.get("main_ideas")),
        "influenced": clean_text(raw.get("influenced")),
        "influenced_by": clean_text(raw.get("influenced_by")),
        "image_url": raw.get("image_url"),
        "wikipedia_url": raw.get("wikipedia_url"),
        "scraped_at": raw.get("scraped_at"),
    }


def run_transform(raw_records: list[dict]) -> list[dict]:
    print(f"[TRANSFORM] Processing {len(raw_records)} raw records...")

    transformed = []
    seen_slugs = set()

    for raw in raw_records:
        record = transform_record(raw)
        if not record:
            print(f"  SKIP (missing required fields): {raw.get('philosopher_name')}")
            continue
        if record["slug"] in seen_slugs:
            print(f"  SKIP (duplicate): {record['philosopher_name']}")
            continue
        seen_slugs.add(record["slug"])
        transformed.append(record)

    print(f"[TRANSFORM] {len(transformed)} clean records ready to load")
    return transformed
