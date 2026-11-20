import { StyleSheet } from 'react-native'
import type { ComponentProps } from 'react'
import { RepeatMode } from '@/helpers/track-player-compat'
import { match } from 'ts-pattern'
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { colors } from '@/constants/tokens'
import { useTrackPlayerRepeatMode } from '@/hooks/useTrackPlayerRepeatMode'
import { LiquidGlassButton } from '@/components/common/LiquidGlassButton'

type Props = { size?: number; buttonSize?: number; glass?: boolean }
type IconName = ComponentProps<typeof MaterialCommunityIcons>['name']

const repeatOrder = [
    RepeatMode.Off,
    RepeatMode.Track,
    RepeatMode.Queue
] as const

export const PlayerRepeatToggle = ({ size = 24, buttonSize = 40, glass = true }: Props) => {
    const { repeatMode, changeRepeatMode } = useTrackPlayerRepeatMode()

    const toggleRepeatMode = () => {
        if (repeatMode == null) return

        const currentIndex = repeatOrder.indexOf(repeatMode)
        const nextIndex = (currentIndex + 1) % repeatOrder.length

        changeRepeatMode(repeatOrder[nextIndex])
    }

    const icon = match(repeatMode)
        .returnType<IconName>()
        .with(RepeatMode.Off, () => 'repeat-off')
        .with(RepeatMode.Track, () => 'repeat-once')
        .with(RepeatMode.Queue, () => 'repeat')
        .otherwise(() => 'repeat-off')

    const accessibilityLabel = match(repeatMode)
        .with(RepeatMode.Off, () => 'Repetición desactivada')
        .with(RepeatMode.Track, () => 'Repetir canción')
        .with(RepeatMode.Queue, () => 'Repetir cola')
        .otherwise(() => 'Cambiar repetición')

    const iconElement = <MaterialCommunityIcons name={icon} size={size} color={colors.icon} />

    if (glass) {
        return (
            <LiquidGlassButton
                onPress={toggleRepeatMode}
                accessibilityRole="button"
                accessibilityLabel={accessibilityLabel}
                style={[styles.glassButton, { width: buttonSize, height: buttonSize }]}
            >
                {iconElement}
            </LiquidGlassButton>
        )
    }

    return (
        <MaterialCommunityIcons
            name={icon}
            onPress={toggleRepeatMode}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel}
            size={size}
            color={colors.icon}
        />
    )
}

const styles = StyleSheet.create({
    glassButton: {
        alignItems: 'center',
        justifyContent: 'center',
    },
})
