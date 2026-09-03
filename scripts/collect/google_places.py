# /// script
# requires-python = ">=3.11"
# dependencies = ["requests"]
# ///
"""Capture Google Places (New) Text Search results for the fixture restaurant list.

Run with uv (reads GOOGLE_PLACES_API_KEY from the environment):

    export GOOGLE_PLACES_API_KEY=your-key-here
    uv run scripts/collect/google_places.py

Writes each restaurant's raw, unmodified response to
src/data/example/google/<slug>.json.
"""

import json
import os
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[2]
RESTAURANTS_FILE = ROOT / "scripts" / "collect" / "restaurants.json"
OUT_DIR = ROOT / "src" / "data" / "example" / "google"

FIELD_MASK = (
    "places.id,places.displayName,places.formattedAddress,"
    "places.location,places.rating,places.userRatingCount"
)


def main() -> None:
    api_key = os.environ.get("GOOGLE_PLACES_API_KEY")
    if not api_key:
        sys.exit("GOOGLE_PLACES_API_KEY is not set.")

    restaurants = json.loads(RESTAURANTS_FILE.read_text())
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for restaurant in restaurants:
        query = f"{restaurant['name']}, {restaurant['city']}"
        response = requests.post(
            "https://places.googleapis.com/v1/places:searchText",
            headers={
                "Content-Type": "application/json",
                "X-Goog-Api-Key": api_key,
                "X-Goog-FieldMask": FIELD_MASK,
            },
            json={"textQuery": query},
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()

        out_path = OUT_DIR / f"{restaurant['slug']}.json"
        out_path.write_text(json.dumps(data, indent=2) + "\n")

        place_count = len(data.get("places", []))
        print(f"{restaurant['slug']}: {place_count} place(s) -> {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
