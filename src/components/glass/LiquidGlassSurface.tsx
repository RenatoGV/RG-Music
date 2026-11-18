import React, { PropsWithChildren } from "react"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { Platform, StyleProp, StyleSheet, View, ViewStyle } from "react-native"
import type { ComponentRef, RefObject } from "react"

type NativeViewRef = ComponentRef<typeof View>

type LiquidGlassSurfaceProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>
  intensity?: number
  borderRadius?: number
  blurTarget?: RefObject<NativeViewRef | null>
}>

/** Reusable translucent glass surface with a lightweight Android fallback. */
export const LiquidGlassSurface = ({
  children,
  style,
  intensity = 60,
  borderRadius = 32,
  blurTarget
}: LiquidGlassSurfaceProps) => (
  <View style={[styles.container, { borderRadius }, style]}>
    <BlurView
      pointerEvents="none"
      intensity={intensity}
      tint="dark"
      blurMethod={Platform.OS === "android" ? "dimezisBlurViewSdk31Plus" : undefined}
      blurTarget={Platform.OS === "android" ? blurTarget : undefined}
      blurReductionFactor={4}
      style={StyleSheet.absoluteFill}
    />
    <LinearGradient
      pointerEvents="none"
      colors={["rgba(255,255,255,0.18)", "rgba(255,255,255,0.025)", "rgba(8,10,12,0.20)"]}
      locations={[0, 0.28, 1]}
      style={[StyleSheet.absoluteFill, { borderRadius }]}
    />
    <View pointerEvents="none" style={[styles.innerBorder, { borderRadius }]} />
    {children}
  </View>
)

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "rgba(14,18,21,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.38)"
  },
  innerBorder: {
    ...StyleSheet.absoluteFill,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.12)"
  }
})
