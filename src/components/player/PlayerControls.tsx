import { TouchableOpacity, View, ViewStyle } from "react-native"
import TrackPlayer, { useIsPlaying } from "@/helpers/track-player-compat"
import { FontAwesome6 } from "@expo/vector-icons"
import { colors } from "@/constants/tokens"
import { playerControlsStyles } from "@/styles/playerControls"

type PlayerControlsProps = {
    style?: ViewStyle
}

type PlayerButtonProps = {
    style?: ViewStyle
    iconSize?: number
}

export const PlayerControls = ({ style }: PlayerControlsProps) => {
    return (
        <View style={[playerControlsStyles.container, style]}>
            <View style={playerControlsStyles.row}>
                <SkipToPreviousButton />

                <PlayPauseButton />

                <SkipToNextButton />
            </View>
        </View>
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