import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"
import TrackPlayer, { useIsPlaying } from "react-native-track-player"
import { FontAwesome6 } from "@expo/vector-icons"
import { colors } from "@/constants/tokens"
import { useLyricStore } from "@/store/lyrics"
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'

type PlayerControlsProps = {
    style?: ViewStyle
}

type PlayerButtonProps = {
    style?: ViewStyle
    iconSize?: number
}

export const PlayerControlsLyrics = ({style}: PlayerControlsProps) => {

   const {setShowLyrics, setSyncedLyrics, syncedLyrics} = useLyricStore()

   return (
      <View style={[styles.container, style]}>
         <View style={styles.row}>
            
            <TouchableOpacity onPress={() => setShowLyrics(false)}>
               <MaterialIcons
                     name={'arrow-back-ios'}
                     size={30}
                     color={colors.icon}
               />
            </TouchableOpacity>

            <SkipToPreviousButton />

            <PlayPauseButton />

            <SkipToNextButton />

            <TouchableOpacity onPress={() => setSyncedLyrics(!syncedLyrics)}>
               <FontAwesome
                     name={(syncedLyrics) ? 'microphone' : 'microphone-slash'}
                     size={30}
                     color={colors.icon}
               />
            </TouchableOpacity>
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

const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    }
})