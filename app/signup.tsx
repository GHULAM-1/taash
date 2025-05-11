import React, { useEffect, useState } from 'react'
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    ToastAndroid,
    Platform,
} from 'react-native'
import { useRouter, Stack } from 'expo-router'
import { googleSignup, signup } from '@/services/api'
import * as Google from 'expo-auth-session/providers/google';
import { makeRedirectUri } from 'expo-auth-session';

export default function Signup() {
    const router = useRouter()
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const redirectUri = makeRedirectUri({ useProxy: true } as any);

    const [request, response, promptAsync] = Google.useAuthRequest({
        clientId: process.env.CLIENT_ID!,
        // iosClientId:     process.env.IOS_CLIENT_ID,
        // webClientId:     process.env.WEB_CLIENT_ID,
        androidClientId: process.env.ANDROID_CLIENT_ID,
        redirectUri: redirectUri,
        scopes:         ['openid','profile','email'],

    })
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
            await signup(email, password)
            if (Platform.OS === 'android') {
                ToastAndroid.show('User created successfully', ToastAndroid.SHORT)
            } else {
                Alert.alert('Success', 'User created successfully')
            }
            router.replace('/login')
        } catch (err: any) {
            console.error(err)
            Alert.alert('Signup failed', err.response?.data?.error || err.message)
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 20 }}>
            <Stack.Screen options={{ headerShown: false, title: 'Sign Up' }} />
            <Text
                style={{
                    fontSize: 24,
                    fontWeight: 'bold',
                    marginBottom: 20,
                    textAlign: 'center',
                    color: 'white',
                }}
            >
                Create Account
            </Text>
            <TextInput
                placeholder="Name"
                placeholderTextColor="#fff"
                value={name}
                onChangeText={setName}
                style={{
                    borderWidth: 1,
                    borderColor: '#ccc',
                    borderRadius: 8,
                    padding: 10,
                    marginBottom: 15,
                    color: 'white',
                }}
            />
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
                onPress={handleSignup}
            >
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>
                    Sign Up
                </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/login')}>
                <Text style={{ color: '#007AFF', textAlign: 'center', marginTop: 10, marginBottom:10 }}>
                    Already have an account? Sign In
                </Text>
            </TouchableOpacity>
            <TouchableOpacity
                onPress={() => promptAsync()}
                style={{ padding: 15, backgroundColor: '#4285F4', borderRadius: 8 }}
            >
                <Text style={{ color: '#fff' }}>Sign Up with Google</Text>
            </TouchableOpacity>
        </View>
    )
}
