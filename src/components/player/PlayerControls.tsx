import { TouchableOpacity, View, ViewStyle } from "react-native"
import TrackPlayer, { useIsPlaying } from "@/helpers/track-player-compat"
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons"
import { colors } from "@/constants/tokens"
import { playerControlsStyles } from "@/styles/playerControls"
import { PlayerRepeatToggle } from '@/components/player/PlayerRepeatToggle'
import { useQueue } from '@/store/queue'
import { shuffleTracks } from '@/helpers/shuffleTracks'
import { reorderQueueAfterCurrent } from '@/helpers/reorderQueueAfterCurrent'
import type { Track } from '@/helpers/types'

type PlayerControlsProps = {
    style?: ViewStyle
    compact?: boolean
}

type PlayerButtonProps = {
    style?: ViewStyle
    iconSize?: number
}

export const PlayerControls = ({ style, compact = false }: PlayerControlsProps) => {
    return (
        <View style={[playerControlsStyles.container, style]}>
            <View style={playerControlsStyles.row}>
                <PlayerRepeatToggle size={compact ? 20 : 24} />
                <SkipToPreviousButton iconSize={compact ? 20 : 30} />

                <PlayPauseButton iconSize={compact ? 36 : 70} />

                <SkipToNextButton iconSize={compact ? 20 : 30} />
                <ShuffleButton iconSize={compact ? 18 : 20} />
            </View>
        </View>
    )
}

const ShuffleButton = ({ iconSize }: { iconSize: number }) => {
    const { shuffleEnabled, setShuffleEnabled, shuffleOriginalQueue, setShuffleOriginalQueue } = useQueue()

    const handleToggleShuffle = () => {
        const queue = TrackPlayer.getQueue()
        const currentIndex = TrackPlayer.getActiveTrackIndex()

        if (currentIndex == null || currentIndex < 0 || currentIndex >= queue.length) return

        const currentUrl = queue[currentIndex].url
        const originalUrls = shuffleEnabled
            ? shuffleOriginalQueue ?? queue.map((track) => track.url)
            : queue.map((track) => track.url)
        const queueByUrl = new Map(queue.map((track) => [track.url, track] as const))
        const originalCurrentIndex = originalUrls.indexOf(currentUrl)
        const pendingUrls = originalCurrentIndex < 0
            ? queue.filter((track) => track.url !== currentUrl).map((track) => track.url)
            : [
                ...originalUrls.slice(originalCurrentIndex + 1),
                ...originalUrls.slice(0, originalCurrentIndex)
            ]
        const pendingTracks = pendingUrls
            .map((url) => queueByUrl.get(url))
            .filter((track): track is Track => track !== undefined)
        const nextShuffleEnabled = !shuffleEnabled

        reorderQueueAfterCurrent(
            nextShuffleEnabled ? shuffleTracks(pendingTracks) : pendingTracks,
            queue,
            currentIndex,
        )
        setShuffleOriginalQueue(nextShuffleEnabled ? originalUrls : null)
        setShuffleEnabled(nextShuffleEnabled)
    }

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleToggleShuffle}
            accessibilityRole="switch"
            accessibilityState={{ checked: shuffleEnabled }}
            accessibilityLabel={shuffleEnabled ? 'Aleatorio activado' : 'Aleatorio desactivado'}
        >
            {shuffleEnabled ? (
                <MaterialCommunityIcons name="shuffle" size={iconSize} color={colors.text} />
            ) : (
                <MaterialCommunityIcons name="shuffle-disabled" size={iconSize} color={colors.text} />
            )}
        </TouchableOpacity>
    )
}

export const PlayPauseButton = ({style, iconSize = 70} : PlayerButtonProps) => {
    const { playing } = useIsPlaying()

    return (
        <View style={[{height: iconSize}, style]}>
            <TouchableOpacity
                activeOpacity={0.85}
                onPress={playing ? TrackPlayer.pause : TrackPlayer.play}
            >
                <FontAwesome6 name={playing ? 'pause' : 'play'} size={iconSize} color={colors.text} />
            </TouchableOpacity>
        </View>
    )
}

export const SkipToNextButton = ({iconSize = 30} : PlayerButtonProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => TrackPlayer.skipToNext()}
        >
            <FontAwesome6 name="forward" size={iconSize} color={colors.text} />
        </TouchableOpacity>
    )
}

export const SkipToPreviousButton = ({iconSize = 30} : PlayerButtonProps) => {
    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => TrackPlayer.skipToPrevious()}
        >
            <FontAwesome6 name="backward" size={iconSize} color={colors.text} />
        </TouchableOpacity>
    )
}
