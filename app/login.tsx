import React, { useEffect, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  Alert, ToastAndroid, Platform
} from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';
import {
  WEB_CLIENT_ID,
  ANDROID_CLIENT_ID,
  IOS_CLIENT_ID
} from '@env';
import { login } from '@/services/api';

WebBrowser.maybeCompleteAuthSession();

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const redirectUri = makeRedirectUri({
    scheme: 'myapp',
    // if you’re running on localhost, you can also do:
    // preferLocalhost: true
  });
  console.log(redirectUri)
  const [request, response, promptAsync] = Google.useAuthRequest({
    redirectUri,
    // webClientId: WEB_CLIENT_ID,
    iosClientId: IOS_CLIENT_ID,           
    androidClientId: ANDROID_CLIENT_ID,      
    scopes: ['openid', 'profile', 'email'],
  });
  useEffect(() => {
    if (response?.type === 'success') {
      const { id_token } = response.params;
      Platform.OS === 'android'
        ? ToastAndroid.show('Logged in with Google', ToastAndroid.SHORT)
        : Alert.alert('Success', 'Logged in with Google');
      router.replace('/test');
    }
  }, [response]);
  const handleLogin = async () => {
    try {
      await login(email, password)

      if (Platform.OS === 'android') {
        ToastAndroid.show('Logged in successfully', ToastAndroid.SHORT)
      } else {
        Alert.alert('Success', 'Logged in successfully')
      }

      router.replace('/test')
    } catch (err: any) {
      console.error(err)
      Alert.alert('Login failed', err.response?.data?.error || err.message)
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
      <Stack.Screen options={{ headerShown: false, title: 'Login' }} />
      <Text
        style={{
          fontSize: 24,
          fontWeight: 'bold',
          marginBottom: 20,
          textAlign: 'center',
          color: 'white',
        }}
      >
        Welcome Back
      </Text>
      <TextInput
        placeholder="Email"
        placeholderTextColor="#fff"
        value={email}
        onChangeText={setEmail}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 10,
          marginBottom: 15,
          color: 'white',
        }}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        placeholderTextColor="#fff"
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          borderColor: '#ccc',
          borderRadius: 8,
          padding: 10,
          marginBottom: 15,
          color: 'white',
        }}
        secureTextEntry
      />
      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          marginBottom: 10,
        }}
        onPress={handleLogin}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          Sign In
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => router.push('/signup')}>
        <Text style={{ color: '#007AFF', textAlign: 'center', marginTop: 10, marginBottom: 10 }}>
          Don't have an account? Sign Up
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => promptAsync()}
        style={{ padding: 15, backgroundColor: '#4285F4', borderRadius: 8}}
      >
        <Text style={{ color: '#fff' }}>Sign Up with Google</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={{
          backgroundColor: '#007AFF',
          padding: 15,
          borderRadius: 8,
          alignItems: 'center',
          marginTop: 10,
        }}
        onPress={() => router.replace('/forget-password')}
      >
        <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
          Forget password
        </Text>
      </TouchableOpacity>
    </View>
  )
}
