import { colors } from "@/constants/tokens"
import { defaultStyles } from "@/styles"
import { StyleSheet, Text, TouchableOpacity, View, ViewProps } from "react-native"
import TrackPlayer from "@/helpers/track-player-compat"
import { Track } from "@/helpers/types"
import { Ionicons } from "@expo/vector-icons"
import { useQueue } from "@/store/queue"

type QueueControlsProps = {
    queueId: string
    tracks: Track[]
} & ViewProps

export const QueueControls = ({queueId, tracks, style, ...viewProps} : QueueControlsProps) => {
    const { setActiveQueueId } = useQueue()

    const handlePlay = () => {
        TrackPlayer.setQueue(tracks)
        setActiveQueueId(queueId)
        TrackPlayer.play()
    }

    const handleShufflePlay = () => {
        const shuffledTracks = [...tracks].sort(() => Math.random() - 0.5 )

        TrackPlayer.setQueue(shuffledTracks)
        setActiveQueueId(queueId)
        TrackPlayer.play()
    }

    return (
        <View style={[{flexDirection: 'row', columnGap: 16}, style]} {...viewProps}>
            {/* Play button */}
            <View style={{flex: 1}}>
                <TouchableOpacity onPress={handlePlay} activeOpacity={0.8} style={styles.button}>
                    <Ionicons name="play" size={22} color={colors.primary} />

                    <Text style={styles.buttonText}>Reproducir</Text>
                </TouchableOpacity>
            </View>

            {/* Shuffle button */}
            <View style={{flex: 1}}>
                <TouchableOpacity onPress={handleShufflePlay} activeOpacity={0.8} style={styles.button}>
                    <Ionicons name="shuffle-sharp" size={22} color={colors.primary} />

                    <Text style={styles.buttonText}>Aleatorio</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        padding: 12,
        backgroundColor: 'rgba(47,47,47,0.5)',
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        columnGap: 8
    },
    buttonText: {
        ...defaultStyles.text,
        color: colors.primary,
        fontWeight: '600',
        fontSize: 18,
        textAlign: 'center'
    }
})
