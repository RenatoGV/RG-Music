import React, { useRef } from 'react'
import {
  Animated,
  Easing,
  TouchableOpacity,
  StyleSheet,
  View,
  Text,
  StyleProp,
  ViewStyle,
  PressableStateCallbackType,
  Pressable,
} from 'react-native'
import FastImage from 'react-native-fast-image'

// convertir FastImage en componente animado
const AnimatedImage = Animated.createAnimatedComponent(FastImage)

type Props = {
  artwork?: string
  unknownTrackImageUri: string
  onPress?: () => void
}

export const ArtworkFlip = ({ artwork, unknownTrackImageUri, onPress }: Props) => {
  const rotation = useRef(new Animated.Value(0)).current

  const handleFlip = () => {
    Animated.timing(rotation, {
      toValue: 1,
      duration: 800,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: true,
    }).start(() => {
      onPress?.()
      rotation.setValue(0)
    })
  }

  // interpolación para rotación
  const rotateX = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })

  // Para efecto flip card (frontal y reverso)
  const frontOpacity = rotation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  })

  const backOpacity = rotation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 1],
  })

  return (
    <Pressable style={styles.artworkImageContainer} onPress={handleFlip} >
      <AnimatedImage
                source={{
                  uri: artwork ?? unknownTrackImageUri,
                  priority: FastImage.priority.high,
                }}
                resizeMode={FastImage.resizeMode.cover}
                style={[
                  styles.artworkImage,
                  {
                    transform: [
                      { perspective: 1000 }, // necesario en 3D
                      { rotateX },
                    ],
                    opacity: frontOpacity,
                  },
                ]}
              />

              {/* Reverso (otra imagen o contenido) */}
              <Animated.View
                style={[
                  styles.artworkImage,
                  styles.backside,
                  {
                    transform: [
                      { perspective: 1000 },
                      { rotateX },
                    ],
                    opacity: backOpacity,
                  },
                ]}
              />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  artworkImageContainer: {
      shadowOffset: {
          width: 0,
          height: 8
      },
      shadowOpacity: 0.44,
      shadowRadius: 11.0,
      flexDirection: 'row',
      justifyContent: 'center',
      height: '45%'
  },
  artworkImage: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 12,
    backfaceVisibility: 'hidden'
  },
  backside: {
    backgroundColor: '#111',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
