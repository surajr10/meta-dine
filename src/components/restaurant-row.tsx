import { Text, View } from "react-native";

import type { Restaurant } from "@/types/restaurant";

export function RestaurantRow({ restaurant }: { restaurant: Restaurant }) {
  return (
    <View className="border-b border-gray-200 px-4 py-3 dark:border-gray-800">
      <Text className="text-base font-semibold text-black dark:text-white">
        {restaurant.name}
      </Text>
      <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
        {restaurant.address}
      </Text>
    </View>
  );
}
