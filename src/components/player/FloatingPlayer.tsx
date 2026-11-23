import { unknownTrackImageUri } from "@/constants/images"
import { defaultStyles } from "@/styles"
import React, { useEffect, useState } from "react"
import { Animated, StyleSheet, Text, View, ViewProps } from "react-native"
import type { BlurViewProps } from "expo-blur"
import FastImage from "react-native-fast-image"
import TrackPlayer, { useActiveTrack } from "@/helpers/track-player-compat"
import { PlayPauseButton, SkipToNextButton } from "@/components/player/PlayerControls"
import { useLastActiveTrack } from "@/hooks/useLastActiveTrack"
import { LiquidGlassSurface } from "@/components/glass/LiquidGlassSurface"
import { MovingText } from "../other/MovingText"
import { useRouter } from "expo-router"
import { useQueue } from "@/store/queue"
import { saveData } from "@/helpers/storage"
import { useFloatingPlayerSwipe } from "@/hooks/useFloatingPlayerSwipe"
import { fontSize } from "@/constants/tokens"

type FloatingPlayerProps = ViewProps & Pick<BlurViewProps, "blurTarget">

export const FloatingPlayer = ({ style, blurTarget }: FloatingPlayerProps) => {

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
            <LiquidGlassSurface
                intensity={15}
                borderRadius={15}
                blurTarget={blurTarget}
                style={styles.glassContent}
            >
                <FastImage
                    source={{
                        uri: currentTrack.artwork ?? unknownTrackImageUri,
                        priority: 'high',
                    }}
                    placeholder={unknownTrackImageUri}
                    style={styles.trackArtworkImage}
                />

                <View style={styles.trackInfoContainer}>
                    <MovingText style={styles.trackTitle}
                        text={currentTrack.title ?? ''}
                        animationThreshold={0}
                    />
                    {currentTrack.artist ? (
                        <Text numberOfLines={1} ellipsizeMode="tail" style={styles.trackArtist}>
                            {currentTrack.artist}
                        </Text>
                    ) : null}
                </View>

                <View style={styles.trackControlsContainer}>
                    <PlayPauseButton iconSize={24} />
                    <SkipToNextButton iconSize={22} />
                </View>
            </LiquidGlassSurface>
        </Animated.View>
    )
}

const styles = StyleSheet.create({
    glassContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 10
    },
    trackArtworkImage: {
        width: 40,
        height: 40,
        borderRadius: 8
    },
    trackInfoContainer: {
        flex: 1,
        minWidth: 0,
        overflow: 'hidden',
        marginLeft: 10
    },
    trackTitle: {
        ...defaultStyles.text,
        fontSize: fontSize.base,
        fontWeight: '600',
        lineHeight: 21,
        paddingLeft: 0
    },
    trackArtist: {
        color: 'rgba(255, 255, 255, 0.72)',
        fontSize: fontSize.sm,
        lineHeight: 15,
    },
    trackControlsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 20,
        marginRight: 16,
        paddingLeft: 16
    }
})
