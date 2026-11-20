import { StyleSheet, Pressable, View } from 'react-native'
import FastImage from 'react-native-fast-image'

type Props = {
  artwork?: string
  unknownTrackImageUri: string
  onPress?: () => void
  compact?: boolean
}

export const PlayerArtwork = ({ artwork, unknownTrackImageUri, onPress, compact = false }: Props) => {
  const borderRadius = compact ? 12 : 24

  return (
    <View style={styles.artworkImageContainer}>
      <Pressable style={[styles.artworkPressable, { borderRadius }]} onPress={onPress} accessibilityRole="button" accessibilityLabel={compact ? 'Cerrar letras' : 'Mostrar letras'}>
      <FastImage
        source={{
          uri: artwork ?? unknownTrackImageUri
        }}
        objectFit="cover"
        style={[styles.artworkImage, { borderRadius }]}
      />
      </Pressable>
    </View>
  )
}

const styles = StyleSheet.create({
  artworkImageContainer: {
      width: '100%',
      height: '100%',
      flex: 1,
      shadowOffset: {
          width: 0,
          height: 8
      },
      shadowOpacity: 0.44,
      shadowRadius: 11.0,
      position: 'relative',
      flexShrink: 0
  },
  artworkPressable: { flex: 1, overflow: 'hidden', borderRadius: 12 },
  artworkImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12
  },
})
