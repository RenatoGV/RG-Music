import { ComponentProps, useEffect, useState } from 'react'
import { RepeatMode } from 'react-native-track-player'
import { match } from 'ts-pattern'
import { MaterialCommunityIcons } from "@expo/vector-icons"
import { colors, fontSize } from '@/constants/tokens'
import { useTrackPlayerRepeatMode } from '@/hooks/useTrackPlayerRepeatMode'
import { View } from 'react-native'
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'

type IconProps = Omit<ComponentProps<typeof MaterialCommunityIcons>, 'name'>
type IconName = ComponentProps<typeof MaterialCommunityIcons>['name']

const repeatOrder = [
    RepeatMode.Off,
    RepeatMode.Track,
    RepeatMode.Queue
] as const

export const PlayerRepeatToggle = ({...iconProps} : IconProps) => {
    const { repeatMode, changeRepeatMode } = useTrackPlayerRepeatMode()
    const [repeatModeText, setRepeatModeText] = useState('No repetir')

    const opacity = useSharedValue(0)

    useEffect(() => {
        match(repeatMode)
            .with(RepeatMode.Off, () => setRepeatModeText('No Repetir'))
            .with(RepeatMode.Track, () => setRepeatModeText('En Bucle'))
            .with(RepeatMode.Queue, () => setRepeatModeText('Repetir Playlist'))

            opacity.value = 0
            opacity.value = withTiming(1, { duration: 180, easing: Easing.out(Easing.ease) }, (finished) => {
                if(finished) {
                    opacity.value = withDelay(500, withTiming(0, { duration: 240, easing: Easing.in(Easing.ease) }))
                }
            })
    }, [repeatMode, opacity])

    const textStyle = useAnimatedStyle(() => ({
        opacity: opacity.value,
        transform: [
            { translateY: opacity.value === 0 ? 4 : 0 }
        ]
    }))

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

    return (
        <View style={{alignItems: 'center', gap: 2}}>
            <Animated.Text style={[{color: colors.text, fontSize: fontSize.sm}, textStyle]}>{repeatModeText}</Animated.Text>
            <MaterialCommunityIcons
                name={icon}
                onPress={toggleRepeatMode}
                color={colors.icon}
                {...iconProps}
            />
        </View>
    )
}