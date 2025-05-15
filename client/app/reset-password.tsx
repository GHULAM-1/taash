import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { API_URL } from '@env';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);


  const handleSubmit = async () => {
    if (!password) {
      Alert.alert('Error', 'Please enter a new password.');
      return;
    }
    if (!token) {
      Alert.alert('Error', 'No reset token provided.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const text = await res.text();
      if (res.ok) {
        Alert.alert('Success', text);
      } else {
        Alert.alert('Error', text);
      }
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 justify-center px-5 bg-black"
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <Text className="text-2xl font-bold text-white text-center mb-6">
        Reset Your Password
      </Text>

      <TextInput
        className="border border-gray-400 rounded-lg px-4 py-3 text-white mb-4"
        placeholder="New password"
        placeholderTextColor="white"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        editable={!loading}
      />

      <TouchableOpacity
        onPress={handleSubmit}
        disabled={loading}
        className={`py-3 rounded-lg items-center ${
          loading ? 'bg-gray-500' : 'bg-blue-600'
        }`}
      >
        <Text className="text-white font-bold text-base">
          {loading ? 'Submitting…' : 'Submit'}
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
