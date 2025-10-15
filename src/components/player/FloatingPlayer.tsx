import { unknownTrackImageUri } from "@/constants/images"
import { defaultStyles } from "@/styles"
import React, { useEffect, useRef, useState } from "react"
import { Animated, PanResponder, StyleSheet, View, ViewProps } from "react-native"
import FastImage from "react-native-fast-image"
import TrackPlayer, { useActiveTrack } from "react-native-track-player"
import { PlayPauseButton, SkipToNextButton } from "@/components/player/PlayerControls"
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack"
import { BlurView } from "expo-blur"
import { MovingText } from "../other/MovingText"
import { useRouter } from "expo-router"
import { useQueue } from "@/store/queue"

export const FloatingPlayer = ({ style } : ViewProps) => {

    const router = useRouter()

    const activeTrack = useActiveTrack()
    const lastActiveTrack = useLastActiveTrack()
    const [currentTrack, setCurrentTrack] = useState(activeTrack ?? lastActiveTrack)
    const {setActiveQueueId} = useQueue()

    useEffect(() => {
        // if(!activeTrack) return setCurrentTrack(undefined)

        if (activeTrack || lastActiveTrack && currentTrack) {
          setCurrentTrack(activeTrack ?? lastActiveTrack);
        }
      }, [activeTrack, lastActiveTrack])

    // Swipe Action
    const translateX = useRef(new Animated.Value(0)).current
    const swipeThreshold = 150

    const panResponder = useRef(
        PanResponder.create({
          onStartShouldSetPanResponder: () => true,
          onPanResponderMove: (_, gestureState) => {
            translateX.setValue(gestureState.dx);
          },
          onPanResponderRelease: (_, gestureState) => {
            if (Math.abs(gestureState.dx) > swipeThreshold) {
              Animated.timing(translateX, {
                toValue: gestureState.dx > 0 ? 500 : -500,
                duration: 200,
                useNativeDriver: true,
              }).start(async () => {
                await TrackPlayer.reset()
                setActiveQueueId(null)
                setCurrentTrack(undefined)
                
                translateX.setValue(0);
              });
            } else {
                if (
                    Math.abs(gestureState.dx) < 5 &&
                    Math.abs(gestureState.dy) < 5
                  ) {
                    router.navigate("/player");
                  }
                  Animated.spring(translateX, {
                    toValue: 0,
                    useNativeDriver: true,
                  }).start()
            }
          },
        })
    ).current
    
    if (!currentTrack) return null

    return (
        <Animated.View style={[style, {transform: [{ translateX }]}]} {...panResponder.panHandlers}>
            {/* <TouchableOpacity onPress={handlePress} activeOpacity={0.9}> */}
                <BlurView
                intensity={100}
                tint="dark"
                style={{
                    overflow: 'hidden',
                    flexDirection: 'row',
                    alignItems: 'center',
                    padding: 8,
                    borderRadius: 12,
                    paddingVertical: 10,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)'
                }}
                >
                    <FastImage
                        source={{
                            uri: currentTrack.artwork ?? unknownTrackImageUri
                        }}
                        style={styles.trackArtworkImage}
                    />

                    <View style={styles.trackTitleContainer}>
                        <MovingText style={styles.trackTitle}
                            text={currentTrack.title ?? ''}
                            animationThreshold={25}
                        />
                    </View>

                    <View style={styles.trackControlsContainer}>
                        <PlayPauseButton iconSize={24} />
                        <SkipToNextButton iconSize={22} />
                    </View>
                </BlurView>
            {/* </TouchableOpacity> */}
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    trackArtworkImage: {
        width: 40,
        height: 40,
        borderRadius: 8
    },
    trackTitleContainer: {
        flex: 1,
        overflow: 'hidden',
        marginLeft: 10
    },
    trackTitle: {
        ...defaultStyles.text,
        fontSize: 18,
        fontWeight: '600',
        paddingLeft: 10
    },
    trackControlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 20,
        marginRight: 16,
        paddingLeft: 16
    }
})