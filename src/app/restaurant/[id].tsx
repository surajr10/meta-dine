import { Stack, useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";

import { RatingRow } from "@/components/rating-row";
import { getRestaurantById } from "@/data/restaurants";
import type { RatingSource } from "@/types/restaurant";

const SOURCES: RatingSource[] = ["google", "yelp", "beli"];

export default function RestaurantDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurant = getRestaurantById(id);

  if (!restaurant) {
    return (
      <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-black">
        <Stack.Screen options={{ title: "Not found" }} />
        <Text className="text-base text-gray-500 dark:text-gray-400">
          Restaurant not found.
        </Text>
      </View>
    );
  }

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
      {SOURCES.map((source) => (
        <RatingRow
          key={source}
          source={source}
          rating={restaurant.ratings[source]}
        />
      ))}
    </View>
  );
}
