import React from 'react'
import { View, Text } from 'react-native'
import { Link } from 'expo-router'

function explore() {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
        <Text style={{color: 'white'}}>
          <Link href="/test">testing the linear </Link>
        </Text>
    </View>
  )
}

export default explore
