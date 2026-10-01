import { Stack, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";

import { RatingRow } from "@/components/rating-row";
import { getGooglePlace } from "@/data/google";
import { getRestaurantById } from "@/data/restaurants";
import type {
  RatingSource,
  RestaurantSummary,
  SourceRating,
} from "@/types/restaurant";

const SOURCES: RatingSource[] = ["google", "yelp", "beli"];

type State =
  | { status: "loading" }
  | { status: "error" }
  | { status: "not_found" }
  | { status: "ok"; restaurant: RestaurantSummary; google: SourceRating };

function Message({ title, text }: { title: string; text: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-black">
      <Stack.Screen options={{ title }} />
      <Text className="text-base text-gray-500 dark:text-gray-400">{text}</Text>
    </View>
  );
}

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [state, setState] = useState<State>({ status: "loading" });

  useEffect(() => {
    let cancelled = false;
    setState({ status: "loading" });
    getGooglePlace(id)
      .then((place) => {
        if (cancelled) return;
        setState(
          place
            ? { status: "ok", restaurant: place.restaurant, google: place.rating }
            : { status: "not_found" },
        );
      })
      .catch(() => {
        if (!cancelled) setState({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (state.status === "loading") {
    return (
      <View className="flex-1 items-center justify-center bg-white dark:bg-black">
        <Stack.Screen options={{ title: "" }} />
        <ActivityIndicator />
      </View>
    );
  }
  if (state.status === "error") {
    return (
      <Message
        title="Error"
        text="Something went wrong. Check your connection and try again."
      />
    );
  }
  if (state.status === "not_found") {
    return <Message title="Not found" text="Restaurant not found." />;
  }

  const { restaurant, google } = state;
  const fixture = getRestaurantById(id);
  const ratings: Partial<Record<RatingSource, SourceRating>> = {
    google,
    yelp: fixture?.ratings.yelp,
    beli: fixture?.ratings.beli,
  };

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <Stack.Screen options={{ title: restaurant.name }} />
      <View className="px-4 py-4">
        <Text className="text-2xl font-semibold text-black dark:text-white">
          {restaurant.name}
        </Text>
        <Text className="mt-1 text-base text-gray-500 dark:text-gray-400">
          {restaurant.address}
        </Text>
      </View>
      {SOURCES.map((source) => {
        const rating = ratings[source];
        return rating ? (
          <RatingRow key={source} source={source} rating={rating} />
        ) : null;
      })}
    </View>
  );
}
