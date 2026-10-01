import type { RestaurantSummary, SourceRating } from "@/types/restaurant";

const BASE_URL = "https://places.googleapis.com/v1";

type GooglePlace = {
  id: string;
  displayName: { text: string };
  formattedAddress: string;
  location: { latitude: number; longitude: number };
  rating?: number;
  userRatingCount?: number;
};

function getApiKey(): string {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("EXPO_PUBLIC_GOOGLE_PLACES_API_KEY is not set");
  return apiKey;
}

function toSummary(place: GooglePlace): RestaurantSummary {
  return {
    id: place.id,
    name: place.displayName.text,
    address: place.formattedAddress,
    lat: place.location.latitude,
    lng: place.location.longitude,
  };
}

export async function searchGooglePlaces(
  query: string,
): Promise<RestaurantSummary[]> {
  const response = await fetch(`${BASE_URL}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask":
        "places.id,places.displayName,places.formattedAddress,places.location",
    },
    body: JSON.stringify({ textQuery: query, includedType: "restaurant" }),
  });
  if (!response.ok) {
    throw new Error(`Google Places search failed (${response.status})`);
  }

  const data: { places?: GooglePlace[] } = await response.json();
  return (data.places ?? []).map(toSummary);
}

export async function getGooglePlace(
  id: string,
): Promise<{ restaurant: RestaurantSummary; rating: SourceRating } | null> {
  const response = await fetch(`${BASE_URL}/places/${id}`, {
    headers: {
      "X-Goog-Api-Key": getApiKey(),
      "X-Goog-FieldMask":
        "id,displayName,formattedAddress,location,rating,userRatingCount",
    },
  });
  if (response.status === 404) return null;
  if (!response.ok) {
    throw new Error(`Google Places details failed (${response.status})`);
  }

  const place: GooglePlace = await response.json();
  return {
    restaurant: toSummary(place),
    rating:
      place.rating == null
        ? { status: "not_found" }
        : {
            status: "ok",
            score: place.rating,
            maxScore: 5,
            reviewCount: place.userRatingCount ?? null,
          },
  };
}
