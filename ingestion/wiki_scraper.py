import requests
import json
import os
from bs4 import BeautifulSoup
from datetime import datetime

BASE_URL = "https://en.wikipedia.org"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (DataEngineeringBot/1.0)"
}


def get_philosopher_links():
    url = f"{BASE_URL}/wiki/List_of_philosophers"
    response = requests.get(url, headers=HEADERS)
    soup = BeautifulSoup(response.text, "html.parser")

    links = set()
    for a in soup.select("div.mw-parser-output ul li a[href^='/wiki/']"):
        href = a["href"]

        # Filter non-article pages
        if any(x in href for x in [":", "#"]):
            continue

        links.add(BASE_URL + href)

    return list(links)


def scrape_philosopher(url):
    response = requests.get(url, headers=HEADERS)
    soup = BeautifulSoup(response.text, "html.parser")

    name = soup.find("h1").get_text(strip=True)

    intro = ""
    for p in soup.select("div.mw-parser-output > p"):
        if p.get_text(strip=True):
            intro = p.get_text(strip=True)
            break

    if not intro:
        raise ValueError("No intro found")

    return {
        "name": name,
        "intro": intro,
        "wikipedia_url": url,
        "scraped_at": datetime.utcnow().isoformat()
    }


if __name__ == "__main__":
    output_dir = "../raw_data/philosophers"
    os.makedirs(output_dir, exist_ok=True)

    data = []
    links = get_philosopher_links()[:50]

    for link in links:
        try:
            data.append(scrape_philosopher(link))
        except Exception as e:
            print(f"Skipped {link}: {e}")

    output_file = f"{output_dir}/2025-01-10.json"
    with open(output_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Scraped {len(data)} philosophers")
