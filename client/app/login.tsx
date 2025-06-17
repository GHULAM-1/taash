// screens/Login.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ToastAndroid, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import { WEB_CLIENT_ID, ANDROID_CLIENT_ID, IOS_CLIENT_ID } from '@env';
import { login } from '@/services/api';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const router = useRouter();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const redirectUri = makeRedirectUri({ scheme: 'myapp' });
  const [request, response, promptAsync] = Google.useAuthRequest({
    redirectUri,
    iosClientId: IOS_CLIENT_ID,           
    androidClientId: ANDROID_CLIENT_ID,      
    scopes: ['openid', 'profile', 'email'],
  });

  useEffect(() => {
    if (response?.type === 'success') {
      Platform.OS === 'android'
        ? ToastAndroid.show('Logged in with Google', ToastAndroid.SHORT)
        : Alert.alert('Success', 'Logged in with Google');
      router.replace('/lobby');
    }
  }, [response]);

  const handleLogin = async () => {
    try {
      await login(email, password);
      Platform.OS === 'android'
        ? ToastAndroid.show('Logged in successfully', ToastAndroid.SHORT)
        : Alert.alert('Success', 'Logged in successfully');
      router.replace('/lobby');
    } catch (err: any) {
      Alert.alert('Login failed', err.response?.data?.error || err.message);
    }
  };

  return (
    <View className="flex-1 justify-center  px-5 bg-black">
      <Stack.Screen options={{ headerShown: false, title: 'Login' }} />

      <Text className="text-2xl font-bold mb-5 text-center text-white">
        Welcome Back
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor="#fff"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        className="border border-gray-400 rounded-lg px-3 py-2 mb-4 text-white"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor="#fff"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        className="border border-gray-400 rounded-lg px-3 py-2 mb-4 text-white"
      />

      <TouchableOpacity
        onPress={handleLogin}
        className="bg-blue-600 py-3 rounded-lg items-center mb-2"
      >
        <Text className="text-white text-base font-bold">Sign In</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text className="text-blue-600 text-center mb-4">
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => promptAsync()}
        className="bg-blue-500 py-3 rounded-lg items-center mb-2"
      >
        <Text className="text-white">Sign Up with Google</Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => router.replace('/forget-password')}
        className="bg-blue-600 py-3 rounded-lg items-center mt-4"
      >
        <Text className="text-white text-base font-bold">Forget password</Text>
      </TouchableOpacity>
    </View>
  );
}
