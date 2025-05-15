import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  ToastAndroid,
  Platform,
} from 'react-native'
import { Stack, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import * as Clipboard from 'expo-clipboard'
import axios from '../../services/api'

interface Game { id: string; name: string; roomId: string }

export default function GamesScreen() {
  const router = useRouter()

  const [myGames, setMyGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [showJoinModal, setShowJoinModal]     = useState(false)
  const [joinCode, setJoinCode]               = useState('')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newName, setNewName]                 = useState('')
  const [creating, setCreating]               = useState(false)

  const fetchMyGames = async () => {
    setLoading(true)
    try {
      const { data } = await axios.get('/api/game/my')
      setMyGames(data)       
    } catch (err:any) {
      Alert.alert('Error', err.response?.data?.message || err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyGames()
  }, [])


  const handleJoin = () => {
    setShowJoinModal(true)
    setJoinCode('')
  }
  const submitJoin = () => {
    if (!joinCode.trim()) {
      return Alert.alert('Please enter a room code')
    }
    setShowJoinModal(false)
    router.push({ pathname: '/game-play-screen', params: { roomId: joinCode.trim() } })
  }

  const handleCreate = () => {
    setShowCreateModal(true)
    setNewName('')
  }
  const submitCreate = async () => {
    if (!newName.trim()) return Alert.alert('Name required')
    setCreating(true)
    try {
      const { data } = await axios.post('/api/game/create', { name: newName })
      setShowCreateModal(false)
      fetchMyGames()
      router.push({ pathname: '/game-play-screen', params: { roomId: data.roomId } })
    } catch (err:any) {
      Alert.alert('Error', err.response?.data?.message || err.message)
    } finally {
      setCreating(false)
    }
  }

  const joinMyGame = (roomId: string) => {
    router.push({ pathname: '/game-play-screen', params: { roomId } })
  }

  const copyCode = async (roomId: string) => {
    await Clipboard.setStringAsync(roomId)
    if (Platform.OS === 'android') {
      ToastAndroid.show('Code copied to clipboard', ToastAndroid.SHORT)
    } else {
      Alert.alert('Copied!', `Room code "${roomId}" copied.`)
    }
  }

  return (
    <View className="flex-1 justify-center bg-black p-5">
      <Stack.Screen options={{ headerShown: false, title: 'game' }} />

      <View className="flex-row justify-between mb-8">
        <TouchableOpacity
          onPress={handleJoin}
          className="flex-1 bg-blue-600 py-4 rounded-lg mr-2 items-center"
        >
          <Text className="text-white">Join a Game</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleCreate}
          className="flex-1 bg-green-600 py-4 rounded-lg ml-2 items-center"
        >
          <Text className="text-white">Create a Game</Text>
        </TouchableOpacity>
      </View>

      <Text className="text-white text-xl font-bold mb-4">
        Games Created by Me
      </Text>
      {loading ? (
        <ActivityIndicator size="large" color="#fff" />
      ) : myGames.length === 0 ? (
        <Text className="text-gray-400">No games yet.</Text>
      ) : (
        myGames.map((g) => (
          <View
            key={g.id}
            className="bg-gray-800 rounded-lg p-4 mb-4"
          >
            <Text className="text-white text-lg mb-1">{g.name}</Text>
            <Text className="text-gray-400 mb-3">Code: {g.roomId}</Text>
            <View className="flex-row justify-end gap-2 space-x-2">
              <TouchableOpacity
                onPress={() => copyCode(g.roomId)}
                className="bg-yellow-600 py-2 px-3 rounded-lg"
              >
                <Text className="text-black font-semibold">Copy Code</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => joinMyGame(g.roomId)}
                className="bg-blue-600 py-2 px-3 rounded-lg"
              >
                <Text className="text-white font-semibold">Join</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <Modal visible={showJoinModal} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-4/5">
            <Text className="text-lg font-bold mb-4">Enter Room Code</Text>
            <TextInput
              value={joinCode}
              onChangeText={setJoinCode}
              placeholder="ABCD1234"
              autoCapitalize="characters"
              className="border border-gray-300 rounded px-3 py-2 mb-4"
            />
            <View className="flex-row justify-end">
              <TouchableOpacity onPress={() => setShowJoinModal(false)}>
                <Text className="mr-4 text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitJoin}>
                <Text className="text-blue-600 font-bold">Go</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showCreateModal} transparent animationType="slide">
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-lg p-6 w-4/5">
            <Text className="text-lg font-bold mb-4">New Game Name</Text>
            <TextInput
              value={newName}
              onChangeText={setNewName}
              placeholder="My Awesome Game"
              className="border border-gray-300 rounded px-3 py-2 mb-4"
            />
            <View className="flex-row justify-end">
              <TouchableOpacity onPress={() => setShowCreateModal(false)}>
                <Text className="mr-4 text-gray-600">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={submitCreate} disabled={creating}>
                <Text className="text-green-600 font-bold">
                  {creating ? 'Creating…' : 'Create'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  )
}
