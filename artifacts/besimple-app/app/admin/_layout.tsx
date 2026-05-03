import { Stack, useRouter, useSegments } from "expo-router";
import React, { useEffect } from "react";

import { useAdminAuth } from "@/context/AdminAuthContext";
import { useColors } from "@/hooks/useColors";

export default function AdminLayout() {
  const { isAdmin, isLoading } = useAdminAuth();
  const router = useRouter();
  const segments = useSegments();
  const colors = useColors();

  useEffect(() => {
    if (isLoading) return;
    const inLogin = segments[segments.length - 1] === "login";
    if (!isAdmin && !inLogin) {
      router.replace("/admin/login");
    }
  }, [isAdmin, isLoading, segments]);

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: "slide_from_right",
      }}
    >
      <Stack.Screen name="login" options={{ animation: "fade" }} />
      <Stack.Screen name="index" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="products" />
    </Stack>
  );
}
