import { colors, fontSize } from '@/constants/tokens'
import { FontAwesome } from '@expo/vector-icons'
import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { StyleProp, ViewStyle } from 'react-native'

type EmptyStateProps = {
  title: string
  description?: string
  footer?: ReactNode
  style?: StyleProp<ViewStyle>
}

export const EmptyState = ({
  title,
  description,
  footer,
  style,
}: EmptyStateProps) => (
  <View style={[styles.container, style]}>
    <View style={styles.icon}>
      <FontAwesome name="music" size={30} color={colors.primary} />
    </View>
    <Text style={styles.title}>{title}</Text>
    {description ? <Text style={styles.description}>{description}</Text> : null}
    {footer}
  </View>
)

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
    paddingBottom: 45,
  },
  icon: {
    width: 62,
    height: 62,
    borderRadius: 22,
    backgroundColor: 'rgba(32,216,96,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
  },
  title: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 14,
  },
  description: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    lineHeight: 20,
    textAlign: 'center',
    marginTop: 8,
  },
})
