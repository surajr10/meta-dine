# /// script
# requires-python = ">=3.11"
# dependencies = ["requests", "geopy"]
# ///
"""Capture Beli search results for the fixture restaurant list.

Run with uv (reads credentials and endpoints from the environment):

    export GOOGLE_PLACES_API_KEY=...
    export BELI_USERNAME=you@example.com
    export BELI_PASSWORD=your-password
    export BELI_AUTH_URL=...
    ...
    uv run scripts/collect/beli.py

Writes each restaurant's raw, unmodified search response to
src/data/example/beli/<slug>.json.
"""

import json
import os
import sys
from pathlib import Path

import requests
from geopy.geocoders import GoogleV3
from urllib.parse import urlencode, quote

ROOT = Path(__file__).resolve().parents[2]
RESTAURANTS_FILE = ROOT / "scripts" / "collect" / "restaurants.json"
GOOGLE_DIR = ROOT / "src" / "data" / "example" / "google"
OUT_DIR = ROOT / "src" / "data" / "example" / "beli"


def login(auth_url: str, email: str, password: str, headers: dict) -> str:
    response = requests.post(
        auth_url, json={"email": email, "password": password}, headers=headers, timeout=10
    )
    response.raise_for_status()
    return response.json()["access"]

def get_user_id(user_url: str, headers: dict) -> str:
    response = requests.get(user_url, headers=headers, timeout=10)
    response.raise_for_status()
    return response.json().get("results", [{}])[0].get("id", "")

def search(search_url: str, name: str, user_id: str, city: str, latitude: float, longitude: float, headers: dict) -> dict:
    search_params = {
        "term": name,
        "city": city,
        "coords": f"{latitude},{longitude}",
        "user": user_id,
    }
    search_query = urlencode(search_params, quote_via=quote, safe=",")
    response = requests.get(
        search_url,
        headers=headers,
        params=search_query,
        timeout=10,
    )
    response.raise_for_status()
    return response.json()

def get_rec_score(rec_score_url: str, user_id: str, business_id: str, headers: dict) -> float:
    response = requests.get(
        rec_score_url,
        headers=headers,
        params={"user": user_id, "business": business_id},
        timeout=10,
    )
    response.raise_for_status()
    return response.json().get("results", {}).get("expected_percentile", None)

def get_avg_score(avg_score_url: str, business_id: str, headers: dict) -> float:
    response = requests.get(
        avg_score_url,
        headers=headers,
        params={"business": business_id},
        timeout=10,
    )
    response.raise_for_status()
    results = response.json().get("results", [])
    if not results:
        return None
    return results[0].get("value", None)


def main() -> None:
    email = os.environ.get("BELI_USERNAME")
    password = os.environ.get("BELI_PASSWORD")
    auth_url = os.environ.get("BELI_AUTH_URL")
    search_url = os.environ.get("BELI_SEARCH_URL")
    user_url = os.environ.get("BELI_USER_URL")
    rec_score_url = os.environ.get("BELI_REC_SCORE_URL")
    avg_score_url = os.environ.get("BELI_AVG_SCORE_URL")
    google_geocoder = GoogleV3(api_key=os.environ.get("GOOGLE_PLACES_API_KEY"))

    if not email or not password:
        sys.exit("BELI_USERNAME and BELI_PASSWORD must be set.")
    if not auth_url or not search_url or not user_url or not rec_score_url or not avg_score_url:
        sys.exit("All BELI API URLs must be set.")
    if not os.environ.get("GOOGLE_PLACES_API_KEY"):
        sys.exit("GOOGLE_PLACES_API_KEY must be set.")

    headers = {
        "content-type": "application/json",
        "origin": "capacitor://localhost",
        "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 18_7 like Mac OS X) "
                    "AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148",
    }

    access_token = login(auth_url, email, password, headers)
    headers["Authorization"] = f"Bearer {access_token}"
    user_id = get_user_id(user_url, headers)

    restaurants = json.loads(RESTAURANTS_FILE.read_text())
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for restaurant in restaurants:
        print(f"Searching for {restaurant['name']} in {restaurant['city']}")

        # Geocode the restaurant's location
        location = google_geocoder.geocode(restaurant['city'])
        if not location:
            print(f"Could not geocode {restaurant['name']}, {restaurant['city']}")
            continue
        latitude, longitude = location.latitude, location.longitude

        data = search(search_url, restaurant["name"], user_id, restaurant["city"], latitude, longitude, headers)
        for item in data.get("predictions", []):
            business_id = item.get("business", "")
            if not business_id:
                continue
            item["rec_score"] = get_rec_score(rec_score_url, user_id, business_id, headers)
            item["avg_score"] = get_avg_score(avg_score_url, business_id, headers)
        
        out_path = OUT_DIR / f"{restaurant['slug']}.json"
        out_path.write_text(json.dumps(data, indent=2) + "\n")
        print(f"{restaurant['slug']}: wrote search response -> {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
