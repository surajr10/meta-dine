import "../global.css";
import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack
      screenOptions={{
        headerTitleStyle: { fontWeight: "600" },
        contentStyle: { backgroundColor: "white" },
      }}
    >
      <Stack.Screen name="index" options={{ title: "meta-dine" }} />
    </Stack>
  );
}
