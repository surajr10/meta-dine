import { Text, View } from "react-native";

export default function Index() {
  return (
    <View className="flex-1 items-center justify-center bg-white px-6 dark:bg-black">
      <Text className="text-2xl font-semibold text-black dark:text-white">
        meta-dine
      </Text>
      <Text className="mt-2 text-center text-base text-gray-500 dark:text-gray-400">
        Google, Yelp, and Beli ratings — side by side.
      </Text>
    </View>
  );
}
