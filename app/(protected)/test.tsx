import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ToastAndroid,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { fetchProtected, logout } from '../../services/api'

export default function Test() {
  const router = useRouter()
  const [message, setMessage] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetchProtected()
        setMessage(res.data.message)
      } catch (err: any) {
        const errMsg = err.response?.data?.error || err.message
        setError(errMsg)
        Alert.alert('Error', errMsg)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      if (Platform.OS === 'android') {
        ToastAndroid.show('Logged out', ToastAndroid.SHORT)
      } else {
        Alert.alert('Success', 'Logged out')
      }
      router.replace('/login')
    } catch (err: any) {
      Alert.alert('Logout failed', err.response?.data?.error || err.message)
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : error ? (
        <Text
          style={{
            color: 'red',
            fontSize: 16,
            textAlign: 'center',
            paddingHorizontal: 20,
            marginBottom: 20,
          }}
        >
          {error}
        </Text>
      ) : (
        <Text style={{ color: 'white', fontSize: 18, marginBottom: 20 }}>{message}</Text>
      )}
      <TouchableOpacity
        style={{
          backgroundColor: '#ff3b30',
          padding: 12,
          borderRadius: 8,
          alignItems: 'center',
          width: '60%',
        }}
        onPress={handleLogout}
      >
        <Text style={{ color: 'white', fontSize: 16 }}>Logout</Text>
      </TouchableOpacity>
    </View>
  )
}
