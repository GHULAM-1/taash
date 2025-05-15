import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  ActivityIndicator,
  Alert,
  Dimensions,
  TouchableOpacity,
} from "react-native";
import { router, Stack, useLocalSearchParams } from "expo-router";
import Pusher from "pusher-js/react-native";
import * as ScreenOrientation from "expo-screen-orientation";
import { PUSHER_KEY, PUSHER_CLUSTER, API_URL } from "@env";

type Member = { id: string; info: { name: string } };

export default function GamePlayScreen() {
  const { roomId } = useLocalSearchParams<{ roomId: string }>();
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [myID, setMyID] = useState<string>("");
  const pusherRef = useRef<Pusher | null>(null);
  const channelName = `presence-${roomId}`;
  useEffect(() => {
    ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE);
    if (!roomId) {
      Alert.alert("Error", "Missing roomId");
      return;
    }

    const userId = Math.random().toString(36).substr(2, 8);
    setMyID(userId);
    const name = `Player-${userId}`;

    const pusher = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: `${API_URL}/api/game/auth`,
      auth: { params: { roomId, userId, name } },
    });
    const channel = pusher.subscribe(`presence-${roomId}`);

    channel.bind("pusher:subscription_succeeded", (data: any) => {
      const hash = data.members || {};
      const list: Member[] = Object.entries(hash).map(([id, info]) => ({
        id,
        info: info as { name: string },
      }));
      setMembers(list);
      setLoading(false);
      setReady(list.length === 4);
    });
    channel.bind("pusher:member_added", (m: any) => {
      setMembers((cur) => [...cur, { id: m.id, info: m.info }]);
    });
    channel.bind("pusher:member_removed", (m: any) => {
      setMembers((cur) => cur.filter((x) => x.id !== m.id));
      setReady(false);
    });

    return () => {
      pusher.unsubscribe(`presence-${roomId}`);
      pusher.disconnect();
    };
  }, [roomId]);

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-black">
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }
  const handleExit = () => {
    const p = pusherRef.current;
    if (p) {
      p.unsubscribe(channelName);
      p.disconnect();
    }
    router.replace("/lobby");
  };
  const you = members.find((m) => m.id === myID);
  const others = members.filter((m) => m.id !== myID);

  const { width, height } = Dimensions.get("window");
  const margin = 40;

  return (
    <View className="flex-1 justify-center bg-black">
      <Stack.Screen options={{ headerShown: false, title: `Room ${roomId}` }} />

      <View style={{ flex: 1 }}>
        {others[0] && (
          <View
            className="bg-gray-800 items-center justify-center rounded-lg p-4"
            style={{
              position: "absolute",
              top: margin,
              left: width / 2 - 50,
              width: 100,
              height: 100,
            }}
          >
            <Text className="text-white">{others[0].info.name}</Text>
          </View>
        )}

        {others[1] && (
          <View
            className="bg-gray-800 items-center justify-center rounded-lg p-4"
            style={{
              position: "absolute",
              top: height / 2 - 50,
              left: margin,
              width: 100,
              height: 100,
            }}
          >
            <Text className="text-white">{others[1].info.name}</Text>
          </View>
        )}

        {others[2] && (
          <View
            className="bg-gray-800 items-center justify-center rounded-lg p-4"
            style={{
              position: "absolute",
              top: height / 2 - 50,
              left: width - margin - 100,
              width: 100,
              height: 100,
            }}
          >
            <Text className="text-white">{others[2].info.name}</Text>
          </View>
        )}

        {you && (
          <View
            className="bg-blue-600 items-center justify-center rounded-lg p-4"
            style={{
              position: "absolute",
              top: height - margin - 100,
              left: width / 2 - 50,
              width: 100,
              height: 100,
            }}
          >
            <Text className="text-white">{you.info.name} (You)</Text>
          </View>
        )}

        <View
          style={{
            position: "absolute",
            top: height - margin - 40,
            left: width - margin - 80,
          }}
        >
          <TouchableOpacity
            onPress={handleExit}
            className="bg-red-600 rounded-lg px-4 py-2"
          >
            <Text className="text-white">Exit</Text>
          </TouchableOpacity>
        </View>
      </View>

      {ready && (
        <View className="absolute top-4 left-0 right-0 items-center">
          <Text className="text-green-400 font-bold text-lg">
            All players have joined! 🎉
          </Text>
        </View>
      )}
    </View>
  );
}
