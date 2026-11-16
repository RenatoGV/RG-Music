import { StyleSheet, TouchableOpacity, View, ViewStyle } from "react-native"
import { FontAwesome, FontAwesome6 } from "@expo/vector-icons"
import { colors } from "@/constants/tokens"
import { useLyricStore } from "@/store/lyrics"
import { PlayPauseButton, SkipToNextButton, SkipToPreviousButton } from '@/components/player/PlayerControls'

type PlayerControlsProps = {
    style?: ViewStyle
}

export const PlayerControlsLyrics = ({style}: PlayerControlsProps) => {
    const {setShowLyrics, setSyncedLyrics, syncedLyrics} = useLyricStore()

    return (
        <View style={[styles.container, style]}>
            <View style={styles.row}>
                <TouchableOpacity onPress={() => setShowLyrics(false)}>
                    <FontAwesome6
                        name={'angle-down'}
                        size={30}
                        color={colors.icon}
                    />
                </TouchableOpacity>

                <SkipToPreviousButton />

                <PlayPauseButton />

                <SkipToNextButton />

                <TouchableOpacity onPress={() => setSyncedLyrics(!syncedLyrics)} style={styles.btnContainer}>
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

const styles = StyleSheet.create({
    container: {
        width: '100%'
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center'
    },
    btnContainer: {
        width: 30,
        height: 30,
        alignItems: 'center'
    }
})
