import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';
import { API_URL } from '@env';
import { Stack, useRouter } from 'expo-router';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const router = useRouter();
    const handleForgot = async () => {
        try {
            const res = await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            Alert.alert('Success', res.data.message);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.error || 'Something went wrong');
        }
    };

    return (
        <View style={{ padding: 20, marginTop: 100 }}>
            <Stack.Screen options={{ headerShown: false, title: 'Forgot passsword' }} />
            <Text style={{ color: 'white' }}>Enter your email to reset your password:</Text>
            <TextInput
                placeholder="Email"
                placeholderTextColor={"white"}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                selectionColor="white"
                style={{
                    borderWidth: 1,
                    padding: 10,
                    marginVertical: 10,
                    borderColor: 'white',
                    borderRadius: 10,
                    color: 'white'
                }}
            />
            <View style={{ marginVertical: 10 }}>
                <Button title="Send Reset Link" onPress={handleForgot} />
            </View>
            <Button title='back to login' onPress={() => router.replace('/login')} />
        </View>
    );
}
