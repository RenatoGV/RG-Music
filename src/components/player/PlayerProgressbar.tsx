import { colors, fontSize } from '@/constants/tokens'
import { formatSecondsToMinute } from '@/helpers/miscellaneous'
import { defaultStyles } from '@/styles'
import { useEffect } from 'react'
import { StyleSheet, Text, View, ViewProps } from 'react-native'
import { Slider } from 'react-native-awesome-slider'
import { useSharedValue } from 'react-native-reanimated'
import TrackPlayer, { useProgress } from '@/helpers/track-player-compat'
import { LinearGradient } from 'expo-linear-gradient'
import Svg, { Defs, LinearGradient as SvgLinearGradient, Path, Stop } from 'react-native-svg'

type Props = ViewProps & { compact?: boolean; trackDuration?: number | null }

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
                thumbWidth={28}
                renderThumb={() => (
                    <View style={styles.thumbRing}>
                        <LinearGradient
                            colors={['#20D860', '#138A46']}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.thumbFill}
                        />
                        <Svg pointerEvents="none" style={StyleSheet.absoluteFill} width={28} height={28} viewBox="0 0 28 28">
                            <Defs>
                                <SvgLinearGradient id="thumbRingTopLeft" x1={14} y1={1} x2={1} y2={14} gradientUnits="userSpaceOnUse">
                                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
                                    <Stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.82} />
                                    <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
                                </SvgLinearGradient>
                                <SvgLinearGradient id="thumbRingBottomRight" x1={27} y1={14} x2={14} y2={27} gradientUnits="userSpaceOnUse">
                                    <Stop offset="0%" stopColor="#FFFFFF" stopOpacity={0} />
                                    <Stop offset="50%" stopColor="#FFFFFF" stopOpacity={0.82} />
                                    <Stop offset="100%" stopColor="#FFFFFF" stopOpacity={0} />
                                </SvgLinearGradient>
                            </Defs>
                            <Path
                                d="M 14 1 A 13 13 0 0 0 1 14"
                                fill="none"
                                stroke="url(#thumbRingTopLeft)"
                                strokeWidth={1}
                            />
                            <Path
                                d="M 27 14 A 13 13 0 0 1 14 27"
                                fill="none"
                                stroke="url(#thumbRingBottomRight)"
                                strokeWidth={1}
                            />
                        </Svg>
                    </View>
                )}
                renderBubble={() => null}
                theme={{
                    minimumTrackTintColor: '#20D860',
                    maximumTrackTintColor: 'rgba(32,216,96,0.2)'
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
    sliderTrack: {
        height: 6,
        borderRadius: 3,
    },
    thumbRing: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: 'rgba(255,255,255,0.12)',
        alignItems: 'center',
        justifyContent: 'center',
        elevation: 3,
    },
    thumbFill: {
        width: 20,
        height: 20,
        borderRadius: 11,
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
