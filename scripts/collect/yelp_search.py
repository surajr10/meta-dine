# /// script
# requires-python = ">=3.11"
# dependencies = ["requests"]
# ///
"""Capture Yelp Business Search results for the fixture restaurant list.

Run with uv (reads YELP_API_KEY from the environment):

    export YELP_API_KEY=your-key-here
    uv run scripts/collect/yelp_search.py

Writes each restaurant's raw, unmodified response to
src/data/example/yelp/<slug>.json.
"""

import json
import os
import sys
from pathlib import Path

import requests

ROOT = Path(__file__).resolve().parents[2]
RESTAURANTS_FILE = ROOT / "scripts" / "collect" / "restaurants.json"
OUT_DIR = ROOT / "src" / "data" / "example" / "yelp"


def main() -> None:
    api_key = os.environ.get("YELP_API_KEY")
    if not api_key:
        sys.exit("YELP_API_KEY is not set.")

    restaurants = json.loads(RESTAURANTS_FILE.read_text())
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    for restaurant in restaurants:
        response = requests.get(
            "https://api.yelp.com/v3/businesses/search",
            headers={"Authorization": f"Bearer {api_key}", "accept": "application/json"},
            params={"term": restaurant["name"], "location": restaurant["city"], "sort_by": "best_match", "limit": 3},
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()

        out_path = OUT_DIR / f"{restaurant['slug']}.json"
        out_path.write_text(json.dumps(data, indent=2) + "\n")

        business_count = len(data.get("businesses", []))
        print(f"{restaurant['slug']}: {business_count} business(es) -> {out_path.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
