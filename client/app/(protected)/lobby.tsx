import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ToastAndroid,
  Platform,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { me, logout } from "../../services/api";
import * as ScreenOrientation from "expo-screen-orientation";
import { Ionicons } from "@expo/vector-icons";

export default function LobbyScreen() {
  const router = useRouter();
  const [userEmail, setUserEmail] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await me();
        setUserEmail(res.data.email);
      } catch (err: any) {
        const msg = err.response?.data?.error || err.message;
        setError(msg);
        Alert.alert("Error", msg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      Platform.OS === "android"
        ? ToastAndroid.show("Logged out", ToastAndroid.SHORT)
        : Alert.alert("Success", "Logged out");
      router.replace("/login");
    } catch (err: any) {
      Alert.alert("Logout failed", err.response?.data?.error || err.message);
    }
  };
  const openGame = () => {
    router.push("/game");
  };
  return (
    <View className="flex-1  justify-center bg-black px-5 pt-12">
      <Stack.Screen options={{ headerShown: false, title: "Lobby" }} />

      <TouchableOpacity
        onPress={() => setMenuOpen((v) => !v)}
        className="absolute top-6 right-6 z-10"
      >
        <Ionicons name="person-circle-outline" size={32} color="#fff" />
      </TouchableOpacity>
      {menuOpen && (
        <View className="absolute top-14 right-4 bg-red-600 rounded shadow p-2 z-20">
          <TouchableOpacity onPress={handleLogout} className="py-1 px-3 ">
            <Text className="text-black">Logout</Text>
          </TouchableOpacity>
        </View>
      )}

      <Text className="text-3xl font-bold text-white mb-8 text-center">
        Lobby
      </Text>

      <View className="flex-row justify-between mx-auto gap-5 mb-12">
        {[1, 2, 3].map((i) => (
          <TouchableOpacity
            key={i}
            onPress={openGame}
            className="bg-gray-800 w-32 h-32 rounded-lg items-center justify-center"
          >
            <Text className="text-white">Daketi</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : error ? (
        <Text className="text-red-500 text-center mb-5">{error}</Text>
      ) : null}
    </View>
  );
}
