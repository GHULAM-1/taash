import React, { useState } from "react";
import { View, Text, TextInput, Alert, TouchableOpacity } from "react-native";
import axios from "axios";
import { API_URL } from "@env";
import { Stack, useRouter } from "expo-router";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const router = useRouter();

  const handleForgot = async () => {
    try {
      const res = await axios.post(`${API_URL}/api/auth/forgot-password`, {
        email,
      });
      Alert.alert("Success", res.data.message);
    } catch (err: any) {
      Alert.alert("Error", err.response?.data?.error || "Something went wrong");
    }
  };

  return (
    <View className="flex-1 bg-black px-5 justify-center">
      <Stack.Screen
        options={{ headerShown: false, title: "Forgot password" }}
      />

      <Text className="text-white text-lg mb-2">
        Enter your email to reset your password:
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="white"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        selectionColor="white"
        className="border border-white rounded-lg px-4 py-2 text-white mb-4"
      />

      <TouchableOpacity
        onPress={handleForgot}
        className="bg-blue-600 py-3 rounded-lg mb-4"
      >
        <Text className="text-white text-center font-semibold">
          Send Reset Link
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace("/login")}
        className="py-3 rounded-lg border border-gray-500"
      >
        <Text className="text-white text-center font-semibold">
          Back to Login
        </Text>
      </TouchableOpacity>
    </View>
  );
}
