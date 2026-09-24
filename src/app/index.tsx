import { useState } from "react";
import { FlatList, Text, TextInput, View } from "react-native";

import { RestaurantRow } from "@/components/restaurant-row";
import { searchRestaurants } from "@/data/restaurants";

export default function Index() {
  const [query, setQuery] = useState("");
  const hasQuery = query.trim() !== "";
  const results = hasQuery ? searchRestaurants(query) : [];

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <TextInput
        className="mx-4 my-3 rounded-lg bg-gray-100 px-3 py-2.5 text-base text-black dark:bg-gray-900 dark:text-white"
        placeholder="Search restaurants"
        placeholderTextColor="#9ca3af"
        value={query}
        onChangeText={setQuery}
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RestaurantRow restaurant={item} />}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text className="mt-8 px-6 text-center text-base text-gray-500 dark:text-gray-400">
            {hasQuery
              ? "No restaurants found."
              : "Search for a restaurant to compare its Google, Yelp, and Beli ratings side by side."}
          </Text>
        }
      />
    </View>
  );
}
