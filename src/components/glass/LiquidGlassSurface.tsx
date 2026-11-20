import { useState } from "react"
import type { PropsWithChildren, ComponentRef, RefObject } from "react"
import { BlurView } from "expo-blur"
import { LinearGradient } from "expo-linear-gradient"
import { Platform, StyleSheet, View } from "react-native"
import type { LayoutChangeEvent, StyleProp, ViewStyle } from "react-native"
import { SegmentedGlassBorder } from "@/components/glass/SegmentedGlassBorder"

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
}: LiquidGlassSurfaceProps) => {
  const [size, setSize] = useState({ width: 0, height: 0 })

  const handleLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = nativeEvent.layout
    setSize((previous) => previous.width === width && previous.height === height ? previous : { width, height })
  }

  return (
    <View onLayout={handleLayout} style={[styles.container, { borderRadius }, style]}>
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
      <SegmentedGlassBorder width={size.width} height={size.height} borderRadius={borderRadius} />
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    backgroundColor: "rgba(14,18,21,0.12)",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.14)"
  }
})
