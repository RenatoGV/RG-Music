import { LinearGradient } from 'expo-linear-gradient'
import type { ReactNode } from 'react'
import {
  Pressable,
  StyleSheet,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native'

type GradientButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export const GradientButton = ({ children, style, ...pressableProps }: GradientButtonProps) => (
  <Pressable
    {...pressableProps}
    accessibilityRole={pressableProps.accessibilityRole ?? 'button'}
    style={({ pressed }) => [styles.button, style, pressed && styles.pressed]}
  >
    <LinearGradient
      colors={['#1F8449', '#20D860']}
      start={{ x: 0, y: 0.5 }}
      end={{ x: 1, y: 0.5 }}
      style={StyleSheet.absoluteFill}
    />
    {children}
  </Pressable>
)

const styles = StyleSheet.create({
  button: {
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.8,
  },
})
