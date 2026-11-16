import { unknownTrackImageUri } from "@/constants/images"
import { defaultStyles } from "@/styles"
import React, { useEffect, useState } from "react"
import { Animated, StyleSheet, View, ViewProps } from "react-native"
import FastImage from "react-native-fast-image"
import TrackPlayer, { useActiveTrack } from "@/helpers/track-player-compat"
import { PlayPauseButton, SkipToNextButton } from "@/components/player/PlayerControls"
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack"
import { BlurView } from "expo-blur"
import { MovingText } from "../other/MovingText"
import { useRouter } from "expo-router"
import { useQueue } from "@/store/queue"
import { saveData } from "@/helpers/storage"
import { useFloatingPlayerSwipe } from "@/hooks/useFloatingPlayerSwipe"

export const FloatingPlayer = ({ style } : ViewProps) => {

    const router = useRouter()

    const activeTrack = useActiveTrack()
    const lastActiveTrack = useLastActiveTrack()
    const [currentTrack, setCurrentTrack] = useState(activeTrack ?? lastActiveTrack)
    const {setActiveQueueId} = useQueue()

    useEffect(() => {
        // Keep the last track as the initial display value, but don't restore it
        // after the queue has been cleared (for example, after swiping away).
        if (!activeTrack) return

        setCurrentTrack((previousTrack) => {
            if (
                previousTrack?.url === activeTrack.url &&
                previousTrack.title === activeTrack.title &&
                previousTrack.artist === activeTrack.artist &&
                previousTrack.artwork === activeTrack.artwork
            ) {
                return previousTrack
            }

            return activeTrack
        })
    }, [activeTrack])
    
    const handleDismiss = () => {
        TrackPlayer.reset()
        setActiveQueueId(null)
        setCurrentTrack(undefined)
        saveData('playback_queue', '')
        saveData('playback_position', '')
    }

    const { translateX, panHandlers } = useFloatingPlayerSwipe({ onOpen: () => router.navigate('/player'), onDismiss: handleDismiss })
    
    if (!currentTrack) return null

    return (
        <Animated.View style={[style, {transform: [{ translateX }]}]} {...panHandlers}>
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
