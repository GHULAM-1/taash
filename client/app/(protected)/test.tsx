import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ToastAndroid,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { fetchProtected, logout } from '../../services/api';

export default function Test() {
  const router = useRouter();
  const [message, setMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchProtected();
        setMessage(res.data.message);
      } catch (err: any) {
        const errMsg = err.response?.data?.error || err.message;
        setError(errMsg);
        Alert.alert('Error', errMsg);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      Platform.OS === 'android'
        ? ToastAndroid.show('Logged out', ToastAndroid.SHORT)
        : Alert.alert('Success', 'Logged out');
      router.replace('/login');
    } catch (err: any) {
      Alert.alert('Logout failed', err.response?.data?.error || err.message);
    }
  };

  return (
    <View className="flex-1 justify-center items-center px-5 bg-black">
      {loading ? (
        <ActivityIndicator size="large" color="#ffffff" />
      ) : error ? (
        <Text className="text-red-500 text-center text-base mb-5 px-4">{error}</Text>
      ) : (
        <Text className="text-white text-lg mb-5 text-center">{message}</Text>
      )}

      <TouchableOpacity
        onPress={handleLogout}
        className="bg-red-600 py-3 px-5 rounded-lg w-3/5 items-center"
      >
        <Text className="text-white text-base font-semibold">Logout</Text>
      </TouchableOpacity>
    </View>
  );
}
