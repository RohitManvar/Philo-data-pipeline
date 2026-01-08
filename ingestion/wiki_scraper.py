import requests
import json
import os
import re
from bs4 import BeautifulSoup
from datetime import datetime
from urllib.parse import urlparse

BASE_URL = "https://en.wikipedia.org"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (PhiloDataBot/1.0)"
}


# -----------------------------
# Helpers
# -----------------------------
def create_slug(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def clean_text(text: str) -> str:
    # Remove Wikipedia citations like [1], [2]
    text = re.sub(r"\[\d+\]", "", text)
    return re.sub(r"\s+", " ", text).strip()


# -----------------------------
# Get philosopher article links
# -----------------------------
def get_philosopher_links(limit=50):
    url = f"{BASE_URL}/wiki/List_of_philosophers"
    response = requests.get(url, headers=HEADERS, timeout=10)
    soup = BeautifulSoup(response.text, "html.parser")

    links = set()

    for a in soup.select("div.mw-parser-output ul li a[href^='/wiki/']"):
        href = a["href"]

        # Skip non-article pages
        if any(x in href for x in [":", "#"]):
            continue

        links.add(BASE_URL + href)

        if len(links) >= limit:
            break

    return list(links)


# -----------------------------
# Scrape philosopher page
# -----------------------------
def scrape_philosopher(url):
    response = requests.get(url, headers=HEADERS, timeout=10)
    soup = BeautifulSoup(response.text, "html.parser")

    name = soup.find("h1").get_text(strip=True)
    slug = create_slug(name)

    # First meaningful paragraph
    intro = ""
    for p in soup.select("div.mw-parser-output > p"):
        text = p.get_text(strip=True)
        if len(text) > 50:
            intro = clean_text(text)
            break

    if not intro:
        raise ValueError("Intro paragraph not found")

    # Try extracting infobox data (optional)
    era = None
    school = None

    infobox = soup.find("table", class_="infobox")
    if infobox:
        for row in infobox.select("tr"):
            header = row.find("th")
            value = row.find("td")

            if not header or not value:
                continue

            key = header.get_text(strip=True).lower()
            val = clean_text(value.get_text(" ", strip=True))

            if "era" in key:
                era = val
            elif "school" in key:
                school = val

    return {
        "philosopher_name": name,
        "slug": slug,
        "intro": intro,
        "era": era,
        "school": school,
        "wikipedia_url": url,
        "source_domain": urlparse(url).netloc,
        "scraped_at": datetime.utcnow().isoformat()
    }


# -----------------------------
# Main execution
# -----------------------------
if __name__ == "__main__":
    run_date = datetime.utcnow().strftime("%Y-%m-%d")

    output_dir = f"../raw_data/philosophers/run_date={run_date}"
    os.makedirs(output_dir, exist_ok=True)

    data = []
    links = get_philosopher_links(limit=50)

    for link in links:
        try:
            data.append(scrape_philosopher(link))
        except Exception as e:
            print(f"Skipped {link}: {e}")

    output_file = f"{output_dir}/philosophers.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"✅ Scraped {len(data)} philosophers")
