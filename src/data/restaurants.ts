import type { Restaurant, SourceRating } from "@/types/restaurant";

import sources from "../../scripts/collect/restaurants.json";

// Import Beli restaurant captures
import beliRoosterAndRice from "./example/beli/rooster-and-rice.json";
import beliSottoMare from "./example/beli/sotto-mare.json";
import beliStateBird from "./example/beli/state-bird-provisions.json";
import beliSwan from "./example/beli/swan-oyster-depot.json";
import beliTurtleTower from "./example/beli/turtle-tower.json";
import beliZuni from "./example/beli/zuni-cafe.json";
// Import Google restaurant captures
import googleRoosterAndRice from "./example/google/rooster-and-rice.json";
import googleSottoMare from "./example/google/sotto-mare.json";
import googleStateBird from "./example/google/state-bird-provisions.json";
import googleSwan from "./example/google/swan-oyster-depot.json";
import googleTurtleTower from "./example/google/turtle-tower.json";
import googleZuni from "./example/google/zuni-cafe.json";
// Import Yelp restaurant captures
import yelpRoosterAndRice from "./example/yelp/rooster-and-rice.json";
import yelpSottoMare from "./example/yelp/sotto-mare.json";
import yelpStateBird from "./example/yelp/state-bird-provisions.json";
import yelpSwan from "./example/yelp/swan-oyster-depot.json";
import yelpTurtleTower from "./example/yelp/turtle-tower.json";
import yelpZuni from "./example/yelp/zuni-cafe.json";

type GoogleCapture = {
  places: {
    id: string;
    displayName: { text: string };
    formattedAddress: string;
    location: { latitude: number; longitude: number };
    rating?: number;
    userRatingCount?: number;
  }[];
};

type YelpCapture = {
  businesses: { id: string; rating: number; review_count: number }[];
};

type BeliCapture = {
  predictions: {
    place_id: string;
    avg_score: number | null;
    rec_score: number | null;
    rank_count: number | null;
  }[];
};

const captures: Record<
  string,
  { google: GoogleCapture; yelp: YelpCapture; beli: BeliCapture }
> = {
  "rooster-and-rice": {
    google: googleRoosterAndRice,
    yelp: yelpRoosterAndRice,
    beli: beliRoosterAndRice,
  },
  "zuni-cafe": { google: googleZuni, yelp: yelpZuni, beli: beliZuni },
  "state-bird-provisions": {
    google: googleStateBird,
    yelp: yelpStateBird,
    beli: beliStateBird,
  },
  "swan-oyster-depot": { google: googleSwan, yelp: yelpSwan, beli: beliSwan },
  "turtle-tower": {
    google: googleTurtleTower,
    yelp: yelpTurtleTower,
    beli: beliTurtleTower,
  },
  "sotto-mare": {
    google: googleSottoMare,
    yelp: yelpSottoMare,
    beli: beliSottoMare,
  },
};

const NOT_FOUND: SourceRating = { status: "not_found" };

function buildRestaurant(source: (typeof sources)[number]): Restaurant {
  const capture = captures[source.slug];
  const google = capture.google.places.find(
    (p) => p.id === source.googlePlaceId,
  );
  if (!google) throw new Error(`No Google capture for ${source.slug}`);

  const yelp = capture.yelp.businesses.find(
    (p) => p.id === source.yelpBusinessId,
  );
  const beli = capture.beli.predictions.find(
    (p) => p.place_id === source.googlePlaceId,
  );

  return {
    id: google.id,
    name: google.displayName.text,
    address: google.formattedAddress,
    lat: google.location.latitude,
    lng: google.location.longitude,
    ratings: {
      google:
        google.rating == null
          ? NOT_FOUND
          : {
              status: "ok",
              score: google.rating,
              maxScore: 5,
              reviewCount: google.userRatingCount ?? null,
            },
      yelp:
        yelp?.rating == null
          ? NOT_FOUND
          : {
              status: "ok",
              score: yelp.rating,
              maxScore: 5,
              reviewCount: yelp.review_count,
            },
      beli:
        beli?.avg_score == null
          ? NOT_FOUND
          : {
              status: "ok",
              score: beli.avg_score,
              maxScore: 10,
              reviewCount: beli.rank_count,
              recScore: beli.rec_score ?? undefined,
            },
    },
  };
}

const restaurants = sources.map(buildRestaurant);

export function getAllRestaurants(): Restaurant[] {
  return restaurants;
}

export function getRestaurantById(id: string): Restaurant | undefined {
  return restaurants.find((r) => r.id === id);
}

export function searchRestaurants(query: string): Restaurant[] {
  const q = query.trim().toLowerCase();
  return restaurants.filter((r) => r.name.toLowerCase().includes(q));
}
