import { colors, fontSize } from '@/constants/tokens'
import { formatSecondsToMinute } from '@/helpers/miscellaneous'
import { defaultStyles } from '@/styles'
import { useEffect } from 'react'
import { StyleSheet, Text, View, ViewProps } from 'react-native'
import { Slider } from 'react-native-awesome-slider'
import Animated, { useSharedValue } from 'react-native-reanimated'
import TrackPlayer, { useProgress } from '@/helpers/track-player-compat'
import { LiquidGlassSurface } from '@/components/glass/LiquidGlassSurface'

type Props = ViewProps & { compact?: boolean; trackDuration?: number | null }

const THUMB_SIZE = 28

export const PlayerProgressbar = ({style, compact = false, trackDuration} : Props) => {

    const {duration: playerDuration, position} = useProgress(100)
    const duration = playerDuration > 0 ? playerDuration : trackDuration ?? 0

    const isSliding = useSharedValue(false)
    const progress = useSharedValue(0)
    const min = useSharedValue(0)
    const max = useSharedValue(1)

    const trackElapsedTime = formatSecondsToMinute(position)
    const trackDurationTime = formatSecondsToMinute(duration)

    useEffect(() => {
        if(!isSliding.value) {
            progress.value = duration > 0 ? position / duration : 0
        }
    }, [position, duration, isSliding, progress])

    return (
        <View style={style}>
            <Slider
                progress={progress}
                minimumValue={min}
                maximumValue={max}
                sliderHeight={28}
                containerStyle={styles.sliderTrack}
                style={styles.slider}
                renderContainer={({ style: trackStyle, seekStyle }) => (
                    <LiquidGlassSurface
                        intensity={35}
                        borderRadius={999}
                        style={trackStyle}
                    >
                        <Animated.View style={[seekStyle, styles.glassProgress]} />
                    </LiquidGlassSurface>
                )}
                thumbWidth={0}
                thumbTouchSize={THUMB_SIZE}
                renderThumb={() => (
                    <LiquidGlassSurface
                        intensity={40}
                        borderRadius={THUMB_SIZE / 2}
                        style={[styles.thumbRing, styles.thumbCenterOffset]}
                    >
                        <View style={styles.thumbCore} />
                    </LiquidGlassSurface>
                )}
                renderBubble={() => null}
                theme={{
                    minimumTrackTintColor: 'transparent',
                    maximumTrackTintColor: 'transparent'
                }}
                onSlidingStart={() => (isSliding.value = true)}
                onValueChange={(value) => {
                    TrackPlayer.seekTo(value * duration)
                }}
                onSlidingComplete={(value) => {
                    if(!isSliding.value) return

                    isSliding.value = false

                    TrackPlayer.seekTo(value * duration)
                }}
            />

            <View style={[styles.timeRow, compact && styles.compactTimeRow]}>
                <Text style={styles.timeText}>{trackElapsedTime}</Text>
                <Text style={styles.timeText}>{trackDurationTime}</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    slider: {
        height: 28,
        zIndex: 1,
    },
    sliderTrack: {
        height: 8,
        borderRadius: 999,
        backgroundColor: 'transparent',
    },
    glassProgress: {
        backgroundColor: 'rgba(255,255,255,0.76)',
    },
    thumbRing: {
        width: THUMB_SIZE,
        height: THUMB_SIZE,
        alignItems: 'center',
        justifyContent: 'center',
    },
    thumbCore: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: colors.text,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: 'rgba(255,255,255,0.72)',
        shadowColor: '#cccccc',
        shadowOpacity: 0.4,
        shadowRadius: 5,
        elevation: 2,
    },
    thumbCenterOffset: {
        transform: [{ translateX: -THUMB_SIZE / 2 }],
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginTop: 16
    },
    timeText: {
        ...defaultStyles.text,
        color: colors.text,
        opacity: 0.75,
        fontSize: fontSize.xs,
        letterSpacing: 0.7,
        fontWeight: '500'
    },
    compactTimeRow: { marginTop: 6 }
})
