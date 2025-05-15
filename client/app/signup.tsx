import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ToastAndroid,
  Platform,
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { googleSignup, signup } from '@/services/api';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const redirectUri = makeRedirectUri({ useProxy: true } as any);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: process.env.CLIENT_ID!,
    androidClientId: process.env.ANDROID_CLIENT_ID,
    redirectUri,
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      googleSignup(response.authentication!.idToken!)
        .then(() => {
          Platform.OS === 'android'
            ? ToastAndroid.show('Google user created', ToastAndroid.SHORT)
            : Alert.alert('Success', 'Google user created');
          router.replace('/login');
        })
        .catch(err =>
          Alert.alert('Google Signup Error', err.response?.data?.error || err.message)
        );
    }
  }, [response]);

  const handleSignup = async () => {
    try {
      await signup(email, password);
      Platform.OS === 'android'
        ? ToastAndroid.show('User created successfully', ToastAndroid.SHORT)
        : Alert.alert('Success', 'User created successfully');
      router.replace('/login');
    } catch (err: any) {
      Alert.alert('Signup failed', err.response?.data?.error || err.message);
    }
  };

  return (
    <View className="flex-1 justify-center px-5 bg-black">
      <Stack.Screen options={{ headerShown: false, title: 'Sign Up' }} />

      <Text className="text-2xl font-bold text-white text-center mb-6">
        Create Account
      </Text>

      <TextInput
        placeholder="Name"
        placeholderTextColor="#fff"
        value={name}
        onChangeText={setName}
        className="border border-gray-400 rounded-lg px-4 py-3 text-white mb-4"
      />

      <TextInput
        placeholder="Email"
        placeholderTextColor="#fff"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="border border-gray-400 rounded-lg px-4 py-3 text-white mb-4"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#fff"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="border border-gray-400 rounded-lg px-4 py-3 text-white mb-4"
      />

      <TouchableOpacity
        onPress={handleSignup}
        className="bg-blue-600 py-3 rounded-lg items-center mb-3"
      >
        <Text className="text-white text-base font-bold">Sign Up</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/login')}>
        <Text className="text-blue-500 text-center mb-4">
          Already have an account? Sign In
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => promptAsync()}
        className="bg-blue-500 py-3 rounded-lg items-center"
      >
        <Text className="text-white text-base font-bold">Sign Up with Google</Text>
      </TouchableOpacity>
    </View>
  );
}
