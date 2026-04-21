import requests
import json
import os
import re
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import urlparse

BASE_URL = "https://en.wikipedia.org"
HEADERS = {"User-Agent": "Mozilla/5.0 (PhiloDataBot/1.0)"}


def create_slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def clean_text(text: str) -> str:
    text = re.sub(r"\[\d+\]", "", text)
    return re.sub(r"\s+", " ", text).strip()


WIKI_API = "https://en.wikipedia.org/w/api.php"

PHILOSOPHER_CATEGORIES = [
    # Western
    "Ancient_Greek_philosophers",
    "Ancient_Roman_philosophers",
    "Medieval_philosophers",
    "Renaissance_philosophers",
    "17th-century_philosophers",
    "18th-century_philosophers",
    "19th-century_philosophers",
    "20th-century_philosophers",
    "German_philosophers",
    "French_philosophers",
    "British_philosophers",
    # Indian
    "Indian_philosophers",
    "Hindu_philosophers",
    "Buddhist_philosophers",
    "Jain_philosophers",
    "Indian_logicians",
    "Indian_spiritual_leaders",
    "Indian_mystics",
    "Advaitin_philosophers",
    # Eastern & Other
    "Chinese_philosophers",
    "Japanese_philosophers",
    "Islamic_philosophers",
    "Ancient_Egyptian_philosophers",
    "African_philosophers",
    "Theosophists",
]

# Famous thinkers not covered by categories above
SPECIFIC_PHILOSOPHERS = [
    "Rajneesh",           # Osho
    "Jiddu_Krishnamurti",
    "Gautama_Buddha",
    "Socrates",
    "Plato",
    "Aristotle",
    "Immanuel_Kant",
    "Friedrich_Nietzsche",
    "Swami_Vivekananda",
    "Ramana_Maharshi",
    "Sri_Aurobindo",
    "Adi_Shankara",
    "Nagarjuna",
    "Chanakya",
    "Confucius",
    "Laozi",
    "Zhuangzi",
    "Rumi",
    "Ibn_Rushd",
    "Ibn_Sina",
]


def get_philosopher_links(limit: int = 100) -> list[str]:
    links = []
    seen = set()

    # Always include specific famous thinkers first
    for title in SPECIFIC_PHILOSOPHERS:
        url = f"{BASE_URL}/wiki/{title}"
        if url not in seen:
            seen.add(url)
            links.append(url)

    for category in PHILOSOPHER_CATEGORIES:
        if len(links) >= limit:
            break
        params = {
            "action": "query",
            "list": "categorymembers",
            "cmtitle": f"Category:{category}",
            "cmtype": "page",
            "cmlimit": 50,
            "format": "json",
        }
        try:
            resp = requests.get(WIKI_API, params=params, headers=HEADERS, timeout=10)
            members = resp.json().get("query", {}).get("categorymembers", [])
            for m in members:
                title = m["title"]
                if title.startswith(("List ", "Index ", "Outline ", "Category:", "Template:")):
                    continue
                url = f"{BASE_URL}/wiki/{title.replace(' ', '_')}"
                if url not in seen:
                    seen.add(url)
                    links.append(url)
                if len(links) >= limit:
                    break
        except Exception as e:
            print(f"  Could not fetch category {category}: {e}")

    return links


def scrape_philosopher(url: str) -> dict:
    response = requests.get(url, headers=HEADERS, timeout=10)
    soup = BeautifulSoup(response.text, "html.parser")

    name = soup.find("h1").get_text(strip=True)
    slug = create_slug(name)

    # First meaningful paragraph — try multiple selectors for varied page structures
    intro = ""
    selectors = [
        "div.mw-parser-output > p",
        "div.mw-parser-output p",
    ]
    for selector in selectors:
        for p in soup.select(selector):
            text = p.get_text(strip=True)
            if len(text) > 30:
                intro = clean_text(text)
                break
        if intro:
            break

    if not intro:
        raise ValueError("Intro not found")

    era = school = birth = death = main_ideas = influenced = influenced_by = image_url = None

    infobox = soup.find("table", class_="infobox")
    if infobox:
        # Image
        img = infobox.find("img")
        if img and img.get("src"):
            image_url = "https:" + img["src"]

        for row in infobox.select("tr"):
            header = row.find("th")
            value = row.find("td")
            if not header or not value:
                continue
            key = header.get_text(strip=True).lower()
            val = clean_text(value.get_text(" ", strip=True))

            if "era" in key:
                era = val
            elif "school" in key or "tradition" in key:
                school = val
            elif "born" in key:
                birth = val
            elif "died" in key:
                death = val
            elif "notable idea" in key or "main interest" in key:
                main_ideas = val
            elif key.startswith("influenced") and "by" not in key:
                influenced = val
            elif "influenced by" in key:
                influenced_by = val

    return {
        "philosopher_name": name,
        "slug": slug,
        "intro": intro,
        "birth": birth,
        "death": death,
        "era": era,
        "school": school,
        "main_ideas": main_ideas,
        "influenced": influenced,
        "influenced_by": influenced_by,
        "image_url": image_url,
        "wikipedia_url": url,
        "scraped_at": datetime.utcnow().isoformat(),
    }


def run_extract(limit: int = 100) -> list[dict]:
    print(f"[EXTRACT] Fetching up to {limit} philosopher links...")
    links = get_philosopher_links(limit)
    print(f"[EXTRACT] Found {len(links)} links. Scraping...")

    raw = []
    for i, link in enumerate(links, 1):
        try:
            data = scrape_philosopher(link)
            raw.append(data)
            print(f"  [{i}/{len(links)}] OK: {data['philosopher_name']}")
        except Exception as e:
            print(f"  [{i}/{len(links)}] SKIP {link}: {e}")

    # Save raw JSON snapshot
    run_date = datetime.utcnow().strftime("%Y-%m-%d")
    out_dir = f"raw_data/philosophers"
    os.makedirs(out_dir, exist_ok=True)
    out_file = f"{out_dir}/{run_date}.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(raw, f, indent=2, ensure_ascii=False)

    print(f"[EXTRACT] Saved {len(raw)} records to {out_file}")
    return raw
