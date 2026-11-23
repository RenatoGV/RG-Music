import { StyleSheet, Pressable, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import { useEffect } from 'react'

type Props = {
  artwork?: string
  unknownTrackImageUri: string
  onPress?: () => void
  compact?: boolean
}

export const PlayerArtwork = ({ artwork, unknownTrackImageUri, onPress, compact = false }: Props) => {
  const borderRadius = useSharedValue(compact ? 12 : 24)

  useEffect(() => {
    borderRadius.value = withDelay(compact ? 0 : 200, withTiming(compact ? 12 : 24, {
      duration: 650,
      easing: Easing.inOut(Easing.cubic),
    }))
  }, [borderRadius, compact])

  const animatedBorderRadius = useAnimatedStyle(() => ({ borderRadius: borderRadius.value }))

  return (
    <View style={styles.artworkImageContainer}>
      <Animated.View style={[styles.artworkClipContainer, animatedBorderRadius]}>
        <Pressable style={styles.artworkPressable} onPress={onPress} accessibilityRole="button" accessibilityLabel={compact ? 'Cerrar letras' : 'Mostrar letras'}>
          <FastImage
            source={{
              uri: artwork ?? unknownTrackImageUri,
              priority: 'high',
            }}
            objectFit="cover"
            placeholder={unknownTrackImageUri}
            style={styles.artworkImage}
          />
        </Pressable>
      </Animated.View>
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
  artworkClipContainer: { flex: 1, overflow: 'hidden' },
  artworkPressable: { flex: 1, overflow: 'hidden' },
  artworkImage: {
    width: '100%',
    height: '100%',
  },
})
