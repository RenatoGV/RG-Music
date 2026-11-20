import { colors, fontSize } from '@/constants/tokens'
import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity } from 'react-native'

export type TrackSortMode = 'alphabetical' | 'addedAt'

type TrackListSortButtonProps = {
  mode: TrackSortMode
  onToggle: () => void
}

export const TrackListSortButton = ({ mode, onToggle }: TrackListSortButtonProps) => {
  const label = mode === 'alphabetical' ? 'Alfabético' : 'Fecha agregada'

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel={`Cambiar orden. Orden actual: ${label}`}
      onPress={onToggle}
      style={styles.button}
    >
      <Ionicons name="swap-vertical" size={15} color={colors.textMuted} />
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  button: {
    alignSelf: 'flex-start',
    width: 140,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    columnGap: 8,
    paddingVertical: 8,
    marginBottom: 12,
  },
  label: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    fontWeight: '400',
  },
})
