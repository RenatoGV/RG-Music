import { colors, fontSize } from "@/constants/tokens"
import { BlurView } from "expo-blur"
import { Tabs } from "expo-router"
import { StyleSheet, View } from "react-native"
import { FontAwesome, MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons"
import React from "react"
import { FloatingPlayer } from "@/components/player/FloatingPlayer"

const TabsNavigation = () => {
  return (
    <>
      <Tabs screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarLabelStyle: {
          fontSize: fontSize.xs,
          fontWeight: '500'
        },
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          borderTopWidth: 0,
          paddingTop: 4,
          height: 60
        },
        tabBarBackground: () => (
          <BlurView
            intensity={100}
            tint="dark"
            style={{
              ...StyleSheet.absoluteFillObject,
              overflow: 'hidden',
              borderTopLeftRadius: 20,
              borderTopRightRadius: 20,
              backgroundColor: 'rgba(0, 0, 0, 0.7)'
            }}
          />
        )
      }}>
          <Tabs.Screen name="favorites" options={{
            title: 'Favoritos',
            tabBarIcon: ({ color }) => <FontAwesome name="heart" size={20} color={color} />
          }} />
          <Tabs.Screen name="playlists" options={{
            title: 'Playlists',
            tabBarIcon: ({ color }) => <MaterialCommunityIcons name="playlist-play" size={28} color={color} />
          }} />
          <Tabs.Screen name="(songs)" options={{
            title: 'Canciones',
            tabBarIcon: ({ color }) => <FontAwesome name="music" size={24} color={color} />
          }} />
          <Tabs.Screen name="artists" options={{
            title: 'Artistas',
            tabBarIcon: ({ color }) => <FontAwesome6 name="users-line" size={20} color={color} />
          }} />
      </Tabs>

      <FloatingPlayer style={{
        position: 'absolute',
        left: 8,
        right: 8,
        bottom: 65
      }} />
    </>
  )
}

export default TabsNavigation