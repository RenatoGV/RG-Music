import { colors } from "@/constants/tokens"
import { Tabs, usePathname } from "expo-router"
import { StyleSheet, View } from "react-native"
import { FontAwesome, MaterialCommunityIcons, FontAwesome6 } from "@expo/vector-icons"
import React, { useEffect, useState } from "react"
import { FloatingPlayer } from "@/components/player/FloatingPlayer"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LiquidGlassSurface } from "@/components/glass/LiquidGlassSurface"
import { LiquidGlassTabAnimationContext, LiquidGlassTabIndicator } from "@/components/glass/LiquidGlassTabIndicator"
import { LiquidGlassBlurTargetContext } from "@/components/glass/LiquidGlassBlurTarget"
import type { ComponentRef, RefObject } from "react"
import { useSharedValue, withSpring } from "react-native-reanimated"

const TabsNavigation = () => {
  const insets = useSafeAreaInsets()
  const pathname = usePathname()
  const tabBarContentHeight = 56
  const floatingPlayerGap = 10
  const tabBarHeight = tabBarContentHeight + insets.bottom + 13
  const [blurTargetRef, setBlurTargetRef] = useState<RefObject<ComponentRef<typeof View> | null> | null>(null)
  const activeTabIndex = pathname.includes('/favorites')
    ? 0
    : pathname.includes('/playlists')
      ? 1
      : pathname.includes('/artists')
        ? 3
        : 2
  const tabAnimationProgress = useSharedValue(activeTabIndex)

  useEffect(() => {
    tabAnimationProgress.value = withSpring(activeTabIndex, { damping: 22, stiffness: 180, mass: 0.8 })
  }, [activeTabIndex, tabAnimationProgress])

  return (
    <LiquidGlassBlurTargetContext.Provider value={setBlurTargetRef}>
      <LiquidGlassTabAnimationContext.Provider value={tabAnimationProgress}>
      <Tabs screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 0,
          height: tabBarHeight,
          paddingTop: 0,
          paddingBottom: insets.bottom + 8,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0
        },
        tabBarItemStyle: {
          height: tabBarContentHeight,
          justifyContent: 'center',
          padding: 0
        },
        tabBarIconStyle: { transform: [{ translateY: 13 }] },
        tabBarBackground: () => (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <LiquidGlassSurface
              intensity={36}
              borderRadius={40}
              blurTarget={blurTargetRef ?? undefined}
              style={{
                position: 'absolute',
                left: 16,
                right: 16,
                bottom: insets.bottom + 8,
                height: tabBarContentHeight
              }}
            />
          </View>
        )
      }}>
          <Tabs.Screen name="favorites" options={{
            title: 'Favoritos',
            tabBarIcon: ({ focused }) => <LiquidGlassTabIndicator active={focused} index={0}><FontAwesome name="heart" size={20} color={colors.icon} /></LiquidGlassTabIndicator>
          }} />
          <Tabs.Screen name="playlists" options={{
            title: 'Playlists',
            tabBarIcon: ({ focused }) => <LiquidGlassTabIndicator active={focused} index={1}><MaterialCommunityIcons name="playlist-play" size={22} color={colors.icon} /></LiquidGlassTabIndicator>
          }} />
          <Tabs.Screen name="(songs)" options={{
            title: 'Canciones',
            tabBarIcon: ({ focused }) => <LiquidGlassTabIndicator active={focused} index={2}><FontAwesome name="music" size={20} color={colors.icon} /></LiquidGlassTabIndicator>
          }} />
          <Tabs.Screen name="artists" options={{
            title: 'Artistas',
            tabBarIcon: ({ focused }) => <LiquidGlassTabIndicator active={focused} index={3}><FontAwesome6 name="users-line" size={19} color={colors.icon} /></LiquidGlassTabIndicator>
          }} />
      </Tabs>

      <FloatingPlayer style={{
        position: 'absolute',
        left: 8,
        right: 8,
        bottom: tabBarContentHeight + insets.bottom + 8 + floatingPlayerGap
      }} blurTarget={blurTargetRef ?? undefined} />
      </LiquidGlassTabAnimationContext.Provider>
    </LiquidGlassBlurTargetContext.Provider>
  )
}

export default TabsNavigation
