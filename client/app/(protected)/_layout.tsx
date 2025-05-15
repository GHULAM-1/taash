// app/(protected)/_layout.tsx
import React, { useEffect, useState } from 'react'
import { View, ActivityIndicator } from 'react-native'
import { Slot, useRouter } from 'expo-router'
import {  me } from '@/services/api'

export default function ProtectedLayout() {
  const [checking, setChecking] = useState(true)
  const router = useRouter()

// app/(protected)/_layout.tsx
useEffect(() => {
    (async () => {
      try {
        const { data } = await me();
        console.log('Logged in as:', data.user);
        setChecking(false);
      } catch {
        router.replace('/login');
      }
    })();
  }, []);
  

  if (checking) {
    return (
      <View className='flex-1 justify-center items-center'>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    )
  }

  return <Slot />
}
