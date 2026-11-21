import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import type { ReactNode } from 'react'
import { useState } from 'react'
import {
  Platform,
  Pressable,
  StyleSheet,
  View,
  type LayoutChangeEvent,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'
import { SegmentedGlassBorder } from '@/components/glass/SegmentedGlassBorder'

type LiquidGlassButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  intensity?: number
  borderRadius?: number
  borderTintColor?: string
}

export const LiquidGlassButton = ({
  children,
  style,
  intensity = 55,
  borderRadius = 999,
  borderTintColor = '#FFFFFF',
  ...pressableProps
}: LiquidGlassButtonProps) => {
  const [size, setSize] = useState({ width: 0, height: 0 })

  const handleLayout = ({ nativeEvent }: LayoutChangeEvent) => {
    const { width, height } = nativeEvent.layout
    setSize((previous) => previous.width === width && previous.height === height ? previous : { width, height })
  }

  return (
    <Pressable
      {...pressableProps}
      accessibilityRole={pressableProps.accessibilityRole ?? 'button'}
      style={({ pressed }) => [styles.pressable, { borderRadius }, pressed && styles.pressed]}
    >
      <View onLayout={handleLayout} style={[styles.surface, { borderRadius }, style]}>
        <BlurView
          pointerEvents="none"
          intensity={intensity}
          tint="dark"
          blurMethod={Platform.OS === 'android' ? 'dimezisBlurViewSdk31Plus' : undefined}
          blurReductionFactor={2}
          style={StyleSheet.absoluteFill}
        />
        <LinearGradient
          pointerEvents="none"
          colors={[
            'rgba(255,255,255,0.13)',
            'rgba(255,255,255,0.035)',
            'rgba(173,153,219,0.045)',
            'rgba(4,16,20,0.18)',
          ]}
          locations={[0, 0.34, 0.68, 1]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={[StyleSheet.absoluteFill, { borderRadius }]}
        />
        <SegmentedGlassBorder width={size.width} height={size.height} borderRadius={borderRadius} tintColor={borderTintColor} />
        {children}
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  pressable: {
    overflow: 'hidden',
  },
  surface: {
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.14)',
    backgroundColor: 'rgba(173,153,219,0.08)',
  },
  pressed: {
    opacity: 0.8,
  },
})
