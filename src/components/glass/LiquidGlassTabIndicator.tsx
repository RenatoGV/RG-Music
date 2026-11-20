import React, { PropsWithChildren, createContext, useContext } from "react"
import { LinearGradient } from "expo-linear-gradient"
import { StyleSheet, View, useWindowDimensions } from "react-native"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import type { SharedValue } from "react-native-reanimated"
import { useSafeAreaInsets } from "react-native-safe-area-context"

export const LiquidGlassTabAnimationContext = createContext<SharedValue<number> | null>(null)
export const LIQUID_GLASS_TAB_BAR_MIN_HORIZONTAL_INSET = 12

export const getLiquidGlassTabBarHorizontalInsets = (leftSafeInset = 0, rightSafeInset = 0) => ({
  left: Math.max(0, leftSafeInset) + LIQUID_GLASS_TAB_BAR_MIN_HORIZONTAL_INSET,
  right: Math.max(0, rightSafeInset) + LIQUID_GLASS_TAB_BAR_MIN_HORIZONTAL_INSET,
})

const TAB_COUNT = 4

type LiquidGlassTabIndicatorProps = PropsWithChildren<{
  active: boolean
  index: number
}>

/** Tab icon holder that adds the bright glass capsule for the selected route. */
export const LiquidGlassTabIndicator = ({ active, index, children }: LiquidGlassTabIndicatorProps) => {
  const progress = useContext(LiquidGlassTabAnimationContext)
  const { width } = useWindowDimensions()
  const safeAreaInsets = useSafeAreaInsets()
  const { left, right } = getLiquidGlassTabBarHorizontalInsets(safeAreaInsets.left, safeAreaInsets.right)
  const tabBarContentWidth = width - left - right

  const animatedStyle = useAnimatedStyle(() => {
    const activeIndex = progress?.value ?? index

    return {
      transform: [{
        translateX: (activeIndex - index) * tabBarContentWidth / TAB_COUNT
      }]
    }
  }, [index, tabBarContentWidth])

  return (
    <View style={styles.container}>
      {active && (
        <Animated.View style={[styles.activeSurface, animatedStyle]}>
          <LinearGradient
            colors={["#1F8449", "#20D860"]}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      )}
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    width: 66,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    overflow: "visible"
  },
  activeSurface: {
    position: "absolute",
    width: 62,
    height: 46,
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.24)"
  }
})
