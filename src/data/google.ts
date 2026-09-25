import type { RestaurantSummary } from "@/types/restaurant";

const FIELD_MASK =
  "places.id,places.displayName,places.formattedAddress,places.location";

type SearchTextResponse = {
  places?: {
    id: string;
    displayName: { text: string };
    formattedAddress: string;
    location: { latitude: number; longitude: number };
  }[];
};

export async function searchGooglePlaces(
  query: string,
): Promise<RestaurantSummary[]> {
  const apiKey = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("EXPO_PUBLIC_GOOGLE_PLACES_API_KEY is not set");

  const response = await fetch(
    "https://places.googleapis.com/v1/places:searchText",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": FIELD_MASK,
      },
      body: JSON.stringify({ textQuery: query, includedType: "restaurant" }),
    },
  );
  if (!response.ok) {
    throw new Error(`Google Places search failed (${response.status})`);
  }

  const data: SearchTextResponse = await response.json();
  return (data.places ?? []).map((place) => ({
    id: place.id,
    name: place.displayName.text,
    address: place.formattedAddress,
    lat: place.location.latitude,
    lng: place.location.longitude,
  }));
}
