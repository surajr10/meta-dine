import { Link } from "expo-router";
import { Pressable, Text } from "react-native";

import type { Restaurant } from "@/types/restaurant";

export function RestaurantRow({ restaurant }: { restaurant: Restaurant }) {
  return (
    <Link
      href={{ pathname: "/restaurant/[id]", params: { id: restaurant.id } }}
      asChild
    >
      <Pressable className="border-b border-gray-200 px-4 py-3 active:bg-gray-100 dark:border-gray-800 dark:active:bg-gray-900">
        <Text className="text-base font-semibold text-black dark:text-white">
          {restaurant.name}
        </Text>
        <Text className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
          {restaurant.address}
        </Text>
      </Pressable>
    </Link>
  );
}
