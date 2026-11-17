import { ComponentProps } from 'react'
import { RepeatMode } from '@/helpers/track-player-compat'
import { match } from 'ts-pattern'
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { colors } from '@/constants/tokens'
import { useTrackPlayerRepeatMode } from '@/hooks/useTrackPlayerRepeatMode'

type IconProps = Omit<ComponentProps<typeof MaterialCommunityIcons>, 'name' | 'onPress'>
type IconName = ComponentProps<typeof MaterialCommunityIcons>['name']

const repeatOrder = [
    RepeatMode.Off,
    RepeatMode.Track,
    RepeatMode.Queue
] as const

export const PlayerRepeatToggle = ({...iconProps} : IconProps) => {
    const { repeatMode, changeRepeatMode } = useTrackPlayerRepeatMode()

    const toggleRepeatMode = () => {
        if(repeatMode == null) return

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

    return <MaterialCommunityIcons
        name={icon}
        onPress={toggleRepeatMode}
        accessibilityRole="button"
        accessibilityLabel={match(repeatMode)
            .with(RepeatMode.Off, () => 'Repetición desactivada')
            .with(RepeatMode.Track, () => 'Repetir canción')
            .with(RepeatMode.Queue, () => 'Repetir cola')
            .otherwise(() => 'Cambiar repetición')}
        color={colors.icon}
        {...iconProps}
    />
}
