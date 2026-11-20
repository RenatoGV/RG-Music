import { colors } from "@/constants/tokens"
import { defaultStyles } from "@/styles"
import { StyleSheet, Text, View, ViewProps } from "react-native"
import { useRef } from "react"
import TrackPlayer from "@/helpers/track-player-compat"
import { Track } from "@/helpers/types"
import { Ionicons } from "@expo/vector-icons"
import { useQueue } from "@/store/queue"
import { shuffleTracks } from "@/helpers/shuffleTracks"
import { reorderQueueAfterCurrent } from "@/helpers/reorderQueueAfterCurrent"
import { deferUntilAfterPaint } from "@/helpers/deferUntilAfterPaint"
import { GradientButton } from "@/components/common/GradientButton"
import { LiquidGlassButton } from "@/components/common/LiquidGlassButton"

type QueueControlsProps = {
    queueId: string
    tracks: Track[]
} & ViewProps

export const QueueControls = ({queueId, tracks, style, ...viewProps} : QueueControlsProps) => {
    const { activeQueueId, setActiveQueueId, shuffleEnabled, setShuffleEnabled, setShuffleOriginalQueue } = useQueue()
    const isShuffleUpdatePending = useRef(false)

    const handlePlay = () => {
        setShuffleOriginalQueue(shuffleEnabled ? tracks.map((track) => track.url) : null)
        TrackPlayer.setShuffleEnabled(false)
        TrackPlayer.setQueue(shuffleEnabled ? shuffleTracks(tracks) : tracks)

        setActiveQueueId(queueId)
        TrackPlayer.play()
    }

    const handleToggleShuffle = () => {
        if (isShuffleUpdatePending.current) return

        const enabled = !shuffleEnabled
        setShuffleEnabled(enabled)
        isShuffleUpdatePending.current = true

        deferUntilAfterPaint(() => {
            try {
                if (activeQueueId !== queueId || !TrackPlayer.isPlaying()) {
                    setShuffleOriginalQueue(null)
                    return
                }

                setShuffleOriginalQueue(enabled ? tracks.map((track) => track.url) : null)

                const queue = TrackPlayer.getQueue()
                const currentIndex = TrackPlayer.getActiveTrackIndex()

                if (currentIndex == null || currentIndex < 0 || currentIndex >= queue.length) return

                const currentTrack = queue[currentIndex]
                const originalIndex = tracks.findIndex((track) => track.url === currentTrack.url)

                if (originalIndex < 0) return

                const remainingTracks = [
                    ...tracks.slice(originalIndex + 1),
                    ...tracks.slice(0, originalIndex),
                ]
                const nextTracks = enabled ? shuffleTracks(remainingTracks) : remainingTracks
                reorderQueueAfterCurrent(nextTracks, queue, currentIndex)
            } finally {
                isShuffleUpdatePending.current = false
            }
        })
    }

    return (
        <View style={[{flexDirection: 'row', columnGap: 16}, style]} {...viewProps}>
            {/* Play button */}
            <View style={{flex: 1}}>
                <GradientButton onPress={handlePlay} style={styles.button}>
                    <Ionicons name="play" size={22} color={colors.text} />

                    <Text style={styles.buttonText}>Reproducir</Text>
                </GradientButton>
            </View>

            {/* Shuffle button */}
            <View style={{flex: 1}}>
                <LiquidGlassButton onPress={handleToggleShuffle} accessibilityRole="switch" accessibilityState={{ checked: shuffleEnabled }} style={styles.button}>
                    <Ionicons name="shuffle-sharp" size={22} color={shuffleEnabled ? colors.primary : colors.text} />

                    <Text style={shuffleEnabled ? styles.buttonTextActive : styles.buttonText}>Aleatorio</Text>
                </LiquidGlassButton>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        padding: 12,
        borderRadius: 50,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        columnGap: 8
    },
    buttonText: {
        ...defaultStyles.text,
        color: colors.text,
        fontWeight: '600',
        fontSize: 18,
        textAlign: 'center'
    },
    buttonTextActive: {
        ...defaultStyles.text,
        color: colors.primary,
        fontWeight: '600',
        fontSize: 18,
        textAlign: 'center'
    }
})
