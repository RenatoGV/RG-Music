import { colors } from "@/constants/tokens"
import { Tabs, usePathname } from "expo-router"
import { StyleSheet, View } from "react-native"
import { FontAwesome } from "@expo/vector-icons"
import Svg, { Path } from "react-native-svg"
import React, { useEffect, useState } from "react"
import { FloatingPlayer } from "@/components/player/FloatingPlayer"
import { useSafeAreaInsets } from "react-native-safe-area-context"
import { LiquidGlassSurface } from "@/components/glass/LiquidGlassSurface"
import {
  getLiquidGlassTabBarHorizontalInsets,
  LiquidGlassTabAnimationContext,
  LiquidGlassTabIndicator
} from "@/components/glass/LiquidGlassTabIndicator"
import { LiquidGlassBlurTargetContext, LiquidGlassBlurTargetRefContext } from "@/components/glass/LiquidGlassBlurTarget"
import type { ComponentRef, RefObject } from "react"
import { useSharedValue, withSpring } from "react-native-reanimated"

const TabsNavigation = () => {
  const insets = useSafeAreaInsets()
  const tabBarHorizontalInsets = getLiquidGlassTabBarHorizontalInsets(insets.left, insets.right)
  const pathname = usePathname()
  const tabBarContentHeight = 56
  const floatingPlayerGap = 10
  const tabBarHeight = tabBarContentHeight + insets.bottom + 13
  const [blurTargetRef, setBlurTargetRef] = useState<RefObject<ComponentRef<typeof View> | null> | null>(null)
  const [activeTabIndex, setActiveTabIndex] = useState(() => getTabIndex(pathname))
  const tabAnimationProgress = useSharedValue(activeTabIndex)

  useEffect(() => {
    // Root-level overlays should keep the tab selected underneath them.
    if (pathname === '/player' || pathname.endsWith('/addTracksToPlaylist')) return
    setActiveTabIndex(getTabIndex(pathname))
  }, [pathname])

  useEffect(() => {
    tabAnimationProgress.value = withSpring(activeTabIndex, { damping: 22, stiffness: 180, mass: 0.8 })
  }, [activeTabIndex, tabAnimationProgress])

  return (
    <LiquidGlassBlurTargetContext.Provider value={setBlurTargetRef}>
      <LiquidGlassBlurTargetRefContext.Provider value={blurTargetRef}>
      <LiquidGlassTabAnimationContext.Provider value={tabAnimationProgress}>
      <Tabs screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarShowLabel: false,
        headerShown: false,
        tabBarStyle: {
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          height: tabBarHeight,
          paddingTop: 0,
          paddingLeft: tabBarHorizontalInsets.left,
          paddingRight: tabBarHorizontalInsets.right,
          paddingBottom: insets.bottom + 8,
          backgroundColor: 'transparent',
          borderTopWidth: 0,
          elevation: 0
        },
        tabBarItemStyle: {
          height: tabBarContentHeight,
          justifyContent: 'center',
          padding: 0,
          overflow: 'visible'
        },
        tabBarIconStyle: {
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'visible',
          transform: [{ translateY: 13 }]
        },
        tabBarBackground: () => (
          <View pointerEvents="none" style={StyleSheet.absoluteFill}>
            <LiquidGlassSurface
              intensity={15}
              borderRadius={40}
              blurTarget={blurTargetRef ?? undefined}
              style={{
                position: 'absolute',
                left: tabBarHorizontalInsets.left,
                right: tabBarHorizontalInsets.right,
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
            tabBarIcon: ({ focused }) => <LiquidGlassTabIndicator active={focused} index={1}>
              <Svg width={22} height={22} viewBox="0 0 24 24">
                <Path
                  fill={colors.icon}
                  d="M12.5 15q1.05 0 1.775-.725T15 12.5V7h3V5h-4v5.5q-.325-.25-.7-.375T12.5 10q-1.05 0-1.775.725T10 12.5t.725 1.775T12.5 15M8 18q-.825 0-1.412-.587T6 16V4q0-.825.588-1.412T8 2h12q.825 0 1.413.588T22 4v12q0 .825-.587 1.413T20 18zm-4 4q-.825 0-1.412-.587T2 20V6h2v14h14v2z"
                />
              </Svg>
            </LiquidGlassTabIndicator>
          }} />
          <Tabs.Screen name="(songs)" options={{
            title: 'Canciones',
            tabBarIcon: ({ focused }) => <LiquidGlassTabIndicator active={focused} index={2}><FontAwesome name="music" size={20} color={colors.icon} /></LiquidGlassTabIndicator>
          }} />
          <Tabs.Screen name="artists" options={{
            title: 'Artistas',
            tabBarIcon: ({ focused }) => <LiquidGlassTabIndicator active={focused} index={3}><FontAwesome name="users" size={19} color={colors.icon} /></LiquidGlassTabIndicator>
          }} />
          <Tabs.Screen name="download" options={{
            title: 'Descubrir',
            tabBarIcon: ({ focused }) => <LiquidGlassTabIndicator active={focused} index={4}><FontAwesome name="cloud-download" size={21} color={colors.icon} /></LiquidGlassTabIndicator>
          }} />
      </Tabs>

      <FloatingPlayer style={{
        position: 'absolute',
        left: 8,
        right: 8,
        bottom: tabBarContentHeight + insets.bottom + 8 + floatingPlayerGap
      }} blurTarget={blurTargetRef ?? undefined} />
      </LiquidGlassTabAnimationContext.Provider>
      </LiquidGlassBlurTargetRefContext.Provider>
    </LiquidGlassBlurTargetContext.Provider>
  )
}

const getTabIndex = (pathname: string) => pathname.includes('/favorites')
  ? 0
  : pathname.includes('/playlists')
    ? 1
    : pathname.includes('/artists')
      ? 3
      : pathname.includes('/download')
        ? 4
        : 2

export default TabsNavigation
