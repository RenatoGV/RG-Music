import type { ReactNode } from 'react'
import { StyleSheet, type PressableProps, type StyleProp, type ViewStyle } from 'react-native'
import { colors } from '@/constants/tokens'
import { LiquidGlassButton } from '@/components/common/LiquidGlassButton'

type PrimaryGlassButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

/** Primary action button with the same tinted-glass treatment as destructive glass actions. */
export const PrimaryGlassButton = ({ children, style, ...pressableProps }: PrimaryGlassButtonProps) => (
  <LiquidGlassButton
    {...pressableProps}
    borderTintColor={colors.primary}
    style={[styles.primaryTint, style]}
  >
    {children}
  </LiquidGlassButton>
)

const withAlpha = (hex: string, alpha: number) => {
  const match = hex.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i)
  if (!match) return hex

  const [, red, green, blue] = match
  return `rgba(${Number.parseInt(red, 16)}, ${Number.parseInt(green, 16)}, ${Number.parseInt(blue, 16)}, ${alpha})`
}

const styles = StyleSheet.create({
  primaryTint: {
    backgroundColor: withAlpha(colors.primary, 0.24),
    borderColor: withAlpha(colors.primary, 0.4),
  },
})
