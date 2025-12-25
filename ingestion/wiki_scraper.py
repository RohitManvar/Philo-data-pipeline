import requests
import json 
from bs4 import BeautifulSoup, soup
from datetime import datetime

BASE_URL = "https://en.wikipedia.org"

def get_philosopher_link():
    url = f"{BASE_URL}/wiki/List_of_philosophers"
    soup = BeautifulSoup(requests.get(url).text, "html.parser")

    links = []
    for a in soup.select("div.mw-parser-output ul li a"):
        if a.get("href","").startswith("/wiki/"):
            links.append(BASE_URL + a["href"])
    return list(set(links))

def scrape_philosopher(url):
    soup = BeautifulSoup(requests.get(url).text, "html.parser")
    name = soup.find("h1").text
    intro = soup.find("p").text

    return {
        "name": name,
        "intro": intro,
        "wikipedia_url": url,
        "scraped_at": datetime.utcnow().isoformat()
    }

if __name__ == "__main__":
    data = []
    for link in get_philosopher_link()[:50]:
        try:
            data.append(scrape_philosopher(link))
        except:
            continue
    
    with open("raw_data/philosophers/2025-01-10.json", "w") as f:
        json.dump(data, f, indent=2)