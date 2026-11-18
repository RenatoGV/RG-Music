import { colors } from "@/constants/tokens"
import { defaultStyles } from "@/styles"
import { StyleSheet, Text, View, ViewProps } from "react-native"
import TrackPlayer, { getPlaybackState } from "@/helpers/track-player-compat"
import { Track } from "@/helpers/types"
import { Ionicons } from "@expo/vector-icons"
import { useQueue } from "@/store/queue"
import { shuffleTracks } from "@/helpers/shuffleTracks"
import { GradientButton } from "@/components/common/GradientButton"
import { LiquidGlassButton } from "@/components/common/LiquidGlassButton"

type QueueControlsProps = {
    queueId: string
    tracks: Track[]
} & ViewProps

export const QueueControls = ({queueId, tracks, style, ...viewProps} : QueueControlsProps) => {
    const { activeQueueId, setActiveQueueId, shuffleEnabled, setShuffleEnabled, setShuffleOriginalQueue } = useQueue()

    const handlePlay = () => {
        setShuffleOriginalQueue(shuffleEnabled ? tracks.map((track) => track.url) : null)
        TrackPlayer.setShuffleEnabled(false)
        TrackPlayer.setQueue(shuffleEnabled ? shuffleTracks(tracks) : tracks)

        setActiveQueueId(queueId)
        TrackPlayer.play()
    }

    const handleToggleShuffle = () => {
        const enabled = !shuffleEnabled
        setShuffleEnabled(enabled)

        if (activeQueueId !== queueId || getPlaybackState().state !== 'playing') {
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

        TrackPlayer.setShuffleEnabled(false)

        // Deja la canción actual al inicio moviendo las que tiene delante.
        for (let index = 0; index < currentIndex; index++) {
            TrackPlayer.move(0, queue.length - 1)
            queue.push(queue.shift()!)
        }

        // Retira las canciones que ya no pertenecen a la lista.
        const nextUrls = new Set(nextTracks.map((track) => track.url))
        for (let index = queue.length - 1; index >= 1; index--) {
            if (!nextUrls.has(queue[index].url)) {
                TrackPlayer.remove(index)
                queue.splice(index, 1)
            }
        }

        // Ordena las pendientes e incorpora las que faltan.
        nextTracks.forEach((track, index) => {
            const targetIndex = index + 1
            let fromIndex = queue.findIndex(
                (item, position) => position >= targetIndex && item.url === track.url,
            )

            if (fromIndex === -1) {
                TrackPlayer.add(track)
                queue.push(track)
                fromIndex = queue.length - 1
            }

            if (fromIndex !== targetIndex) {
                TrackPlayer.move(fromIndex, targetIndex)
                const [movedTrack] = queue.splice(fromIndex, 1)
                queue.splice(targetIndex, 0, movedTrack)
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
                    <Ionicons name="shuffle-sharp" size={22} color={shuffleEnabled ? colors.primary : colors.textMuted} />

                    <Text style={shuffleEnabled ? styles.buttonTextActive : styles.buttonTextInactive}>Aleatorio</Text>
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
    },
    buttonTextInactive: {
        ...defaultStyles.text,
        color: colors.textMuted,
        fontWeight: '600',
        fontSize: 18,
        textAlign: 'center'
    }
})
