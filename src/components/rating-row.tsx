import { Text, View } from "react-native";

import type { RatingSource, SourceRating } from "@/types/restaurant";

const SOURCE_LABELS: Record<RatingSource, string> = {
  google: "Google",
  yelp: "Yelp",
  beli: "Beli",
};

export function RatingRow({
  source,
  rating,
}: {
  source: RatingSource;
  rating: SourceRating;
}) {
  const label = SOURCE_LABELS[source];

  return (
    <View className="flex-row items-center justify-between border-b border-gray-200 px-4 py-4 dark:border-gray-800">
      <Text className="text-base font-semibold text-black dark:text-white">
        {label}
      </Text>
      {rating.status === "ok" ? (
        <View className="items-end">
          <Text className="text-lg font-semibold text-black dark:text-white">
            {rating.score.toFixed(1)}
            <Text className="text-base font-normal text-gray-500 dark:text-gray-400">
              {" "}
              / {rating.maxScore}
            </Text>
          </Text>
          {rating.reviewCount !== null && (
            <Text className="text-sm text-gray-500 dark:text-gray-400">
              {rating.reviewCount.toLocaleString()} reviews
            </Text>
          )}
        </View>
      ) : (
        <Text className="text-base text-gray-500 dark:text-gray-400">
          Not available on {label}
        </Text>
      )}
    </View>
  );
}
