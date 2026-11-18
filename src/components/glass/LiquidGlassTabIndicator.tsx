import React, { PropsWithChildren, createContext, useContext } from "react"
import { LinearGradient } from "expo-linear-gradient"
import { StyleSheet, View, useWindowDimensions } from "react-native"
import Animated, { useAnimatedStyle } from "react-native-reanimated"
import type { SharedValue } from "react-native-reanimated"

export const LiquidGlassTabAnimationContext = createContext<SharedValue<number> | null>(null)

type LiquidGlassTabIndicatorProps = PropsWithChildren<{
  active: boolean
  index: number
}>

/** Tab icon holder that adds the bright glass capsule for the selected route. */
export const LiquidGlassTabIndicator = ({ active, index, children }: LiquidGlassTabIndicatorProps) => {
  const progress = useContext(LiquidGlassTabAnimationContext)
  const { width } = useWindowDimensions()

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: ((progress?.value ?? index) - index) * width / 4 }]
  }), [index, width])

  return (
    <View style={styles.container}>
      {active && (
        <Animated.View style={[styles.activeSurface, animatedStyle]}>
          <LinearGradient
            colors={["#168d4d", "#16d45d"]}
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
    justifyContent: "center"
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
