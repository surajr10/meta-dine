import { useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TextInput,
  View,
} from "react-native";

import { RestaurantRow } from "@/components/restaurant-row";
import { searchGooglePlaces } from "@/data/google";
import type { RestaurantSummary } from "@/types/restaurant";

type Status = "idle" | "loading" | "error" | "done";

export default function Index() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [results, setResults] = useState<RestaurantSummary[]>([]);
  const latestRequest = useRef(0);

  function handleChangeText(text: string) {
    setQuery(text);
    if (text.trim() === "") {
      latestRequest.current++;
      setStatus("idle");
    }
  }

  async function handleSubmit() {
    const term = query.trim();
    if (term === "") return;

    const request = ++latestRequest.current;
    setStatus("loading");
    try {
      const found = await searchGooglePlaces(term);
      if (request !== latestRequest.current) return;
      setResults(found);
      setStatus("done");
    } catch {
      if (request !== latestRequest.current) return;
      setStatus("error");
    }
  }

  return (
    <View className="flex-1 bg-white dark:bg-black">
      <TextInput
        className="mx-4 my-3 rounded-lg bg-gray-100 px-3 py-2.5 text-base text-black dark:bg-gray-900 dark:text-white"
        placeholder="Search restaurants"
        placeholderTextColor="#9ca3af"
        value={query}
        onChangeText={handleChangeText}
        onSubmitEditing={handleSubmit}
        returnKeyType="search"
        autoCapitalize="none"
        autoCorrect={false}
        clearButtonMode="while-editing"
      />
      <FlatList
        data={status === "done" ? results : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <RestaurantRow restaurant={item} />}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          status === "loading" ? (
            <ActivityIndicator className="mt-8" />
          ) : (
            <Text className="mt-8 px-6 text-center text-base text-gray-500 dark:text-gray-400">
              {status === "error"
                ? "Something went wrong. Check your connection and try again."
                : status === "done"
                  ? "No restaurants found."
                  : "Search for a restaurant to compare its Google, Yelp, and Beli ratings side by side."}
            </Text>
          )
        }
      />
    </View>
  );
}
