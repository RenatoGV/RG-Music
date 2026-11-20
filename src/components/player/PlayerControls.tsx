import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"
import { useRef } from "react"
import TrackPlayer, { useIsPlaying } from "@/helpers/track-player-compat"
import { FontAwesome6, MaterialCommunityIcons } from "@expo/vector-icons"
import { colors } from "@/constants/tokens"
import { playerControlsStyles } from "@/styles/playerControls"
import { PlayerRepeatToggle } from '@/components/player/PlayerRepeatToggle'
import { useQueue } from '@/store/queue'
import { shuffleTracks } from '@/helpers/shuffleTracks'
import { reorderQueueAfterCurrent } from '@/helpers/reorderQueueAfterCurrent'
import { deferUntilAfterPaint } from '@/helpers/deferUntilAfterPaint'
import type { Track } from '@/helpers/types'
import { LiquidGlassButton } from '@/components/common/LiquidGlassButton'
import { GradientButton } from '@/components/common/GradientButton'

type PlayerControlsProps = {
    style?: ViewStyle
}

type PlayerButtonProps = {
    style?: ViewStyle
    iconSize?: number
    buttonSize?: number
    glass?: boolean
}

export const PlayerControls = ({ style }: PlayerControlsProps) => {
    return (
        <View style={[playerControlsStyles.container, style]}>
            <View style={playerControlsStyles.row}>
                <PlayerRepeatToggle size={15} buttonSize={40} glass />
                <SkipToPreviousButton iconSize={15} buttonSize={52} glass />

                <PlayPauseButton iconSize={34} buttonSize={80} gradient />

                <SkipToNextButton iconSize={15} buttonSize={52} glass />
                <ShuffleButton iconSize={20} buttonSize={40} glass />
            </View>
        </View>
    )
}

const ShuffleButton = ({ iconSize, buttonSize, glass }: { iconSize: number; buttonSize: number; glass: boolean }) => {
    const { shuffleEnabled, setShuffleEnabled, shuffleOriginalQueue, setShuffleOriginalQueue } = useQueue()
    const isShuffleUpdatePending = useRef(false)

    const handleToggleShuffle = () => {
        if (isShuffleUpdatePending.current) return

        const nextShuffleEnabled = !shuffleEnabled
        setShuffleEnabled(nextShuffleEnabled)
        isShuffleUpdatePending.current = true

        deferUntilAfterPaint(() => {
            try {
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

                reorderQueueAfterCurrent(
                    nextShuffleEnabled ? shuffleTracks(pendingTracks) : pendingTracks,
                    queue,
                    currentIndex,
                )
                setShuffleOriginalQueue(nextShuffleEnabled ? originalUrls : null)
            } finally {
                isShuffleUpdatePending.current = false
            }
        })
    }

    const icon = (
        <MaterialCommunityIcons
            name={'shuffle'}
            size={iconSize}
            color={shuffleEnabled ? colors.primary : colors.text}
        />
    )

    if (glass) {
        return (
            <LiquidGlassButton
                onPress={handleToggleShuffle}
                accessibilityRole="switch"
                accessibilityState={{ checked: shuffleEnabled }}
                accessibilityLabel={shuffleEnabled ? 'Aleatorio activado' : 'Aleatorio desactivado'}
                style={[styles.glassButton, { width: buttonSize, height: buttonSize }]}
            >
                {icon}
            </LiquidGlassButton>
        )
    }

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleToggleShuffle}
            accessibilityRole="switch"
            accessibilityState={{ checked: shuffleEnabled }}
            accessibilityLabel={shuffleEnabled ? 'Aleatorio activado' : 'Aleatorio desactivado'}
        >
            {icon}
        </TouchableOpacity>
    )
}

export const PlayPauseButton = ({style, iconSize = 70, buttonSize = 80, gradient = false} : PlayerButtonProps & { gradient?: boolean }) => {
    const { playing } = useIsPlaying()
    const icon = <FontAwesome6 name={playing ? 'pause' : 'play'} size={iconSize} color={colors.text} />

    if (gradient) {
        return (
            <GradientButton
                onPress={playing ? TrackPlayer.pause : TrackPlayer.play}
                accessibilityLabel={playing ? 'Pausar' : 'Reproducir'}
                style={[styles.gradientButton, { width: buttonSize, height: buttonSize, borderRadius: buttonSize / 2 }, style]}
            >
                {icon}
            </GradientButton>
        )
    }

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

export const SkipToNextButton = ({iconSize = 30, buttonSize = 52, glass = false} : PlayerButtonProps) => {
    const icon = <FontAwesome6 name="forward" size={iconSize} color={colors.text} />

    if (glass) {
        return (
            <LiquidGlassButton
                onPress={() => TrackPlayer.skipToNext()}
                accessibilityLabel="Siguiente canción"
                style={[styles.glassButton, { width: buttonSize, height: buttonSize }]}
            >
                {icon}
            </LiquidGlassButton>
        )
    }

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => TrackPlayer.skipToNext()}
        >
            {icon}
        </TouchableOpacity>
    )
}

export const SkipToPreviousButton = ({iconSize = 30, buttonSize, glass = false} : PlayerButtonProps) => {
    const icon = <FontAwesome6 name="backward" size={iconSize} color={colors.text} />

    if (glass) {
        return (
            <LiquidGlassButton
                onPress={() => TrackPlayer.skipToPrevious()}
                accessibilityLabel="Canción anterior"
                style={[styles.glassButton, { width: buttonSize ?? 52, height: buttonSize ?? 52 }]}
            >
                {icon}
            </LiquidGlassButton>
        )
    }

    return (
        <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => TrackPlayer.skipToPrevious()}
        >
            {icon}
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    glassButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    gradientButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
})
