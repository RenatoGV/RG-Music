import { useEffect, useRef, useState } from 'react'
import {
  Animated,
  Easing, StyleSheet, Pressable
} from 'react-native'
import FastImage from 'react-native-fast-image'
import microphoneIcon from '@/assets/icons/microphone.png'

const AnimatedImage = Animated.createAnimatedComponent(FastImage)

type Props = {
  artwork?: string
  unknownTrackImageUri: string
  onPress?: () => void
}

export const ArtworkFlip = ({ artwork, unknownTrackImageUri, onPress }: Props) => {
  const rotation = useRef(new Animated.Value(0)).current

  const overlayAnim = useRef(new Animated.Value(0)).current
  const [showOverlay, setShowOverlay] = useState(false)

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

  const rotateX = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  })

  const frontOpacity = rotation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0, 0],
  })

  const backOpacity = rotation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 1, 1],
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setShowOverlay(true)
      overlayAnim.setValue(0)
      Animated.timing(overlayAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true
      }).start(() => {
        Animated.timing(overlayAnim, {
          toValue: 0,
          duration: 900,
          delay: 2000,
          useNativeDriver: true
        }).start(() => setShowOverlay(false))
      })
    }, 10000)

    return () => clearInterval(interval)
  }, [overlayAnim])

  const overlayOpacity = overlayAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.7]
  })

  return (
    <Pressable style={styles.artworkImageContainer} onPress={handleFlip} >
      <AnimatedImage
        source={{
          uri: artwork ?? unknownTrackImageUri
        }}
        objectFit="cover"
        style={[
          styles.artworkImage,
          {
            transform: [
              { perspective: 1000 },
              { rotateX },
            ],
            opacity: frontOpacity,
          },
        ]}
      />

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

      {showOverlay && (
        <Animated.View
          pointerEvents="none"
          style={[
          styles.overlay,
          { opacity: overlayOpacity }
          ]}
        >
          <FastImage
            source={microphoneIcon}
            style={{ width: 70, height: 84 }}
          />
        </Animated.View>
      )}
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
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'black',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  }
})
