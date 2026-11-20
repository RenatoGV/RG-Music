import { useEffect, useRef, useState } from "react"
import { View } from "react-native"
import type { LayoutChangeEvent, StyleProp, TextStyle } from "react-native"
import Animated, {
    cancelAnimation,
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated"
import type { AnimatedStyle } from "react-native-reanimated"

export type MovingTextProps = {
    text: string
    style?: StyleProp<TextStyle>
    animatedStyle?: AnimatedStyle<TextStyle>
    animationThreshold: number
    animationEnabled?: boolean
}

const pauseDuration = 2000
const pixelsPerMillisecond = 1 / 18
const minimumTravelDuration = 700
const textWidthSafetyBuffer = 8

export const MovingText = ({ text, animationThreshold, style, animatedStyle, animationEnabled = true }: MovingTextProps) => {
    const translateX = useSharedValue(0)
    const [containerWidth, setContainerWidth] = useState(0)
    const [contentWidth, setContentWidth] = useState(0)
    const containerWidthRef = useRef(0)
    const contentWidthRef = useRef(0)
    const measuredWidthWithBuffer = contentWidth + textWidthSafetyBuffer
    const shouldAnimate = animationEnabled && text.length >= animationThreshold && measuredWidthWithBuffer > containerWidth && containerWidth > 0

    useEffect(() => {
        cancelAnimation(translateX)

        if (!shouldAnimate) {
            translateX.value = 0
            return
        }

        const measuredContainerWidth = containerWidthRef.current
        const measuredContentWidth = contentWidthRef.current + textWidthSafetyBuffer
        const leaveDuration = Math.max(minimumTravelDuration, measuredContentWidth / pixelsPerMillisecond)
        const enterDuration = Math.max(minimumTravelDuration, measuredContainerWidth / pixelsPerMillisecond)

        // Begin and end at the normal left-aligned position, with a two-second hold there.
        const cycle = withSequence(
            withDelay(pauseDuration, withTiming(-measuredContentWidth, {
                duration: leaveDuration,
                easing: Easing.linear,
            })),
            withTiming(measuredContainerWidth, { duration: 0 }),
            withTiming(0, {
                duration: enterDuration,
                easing: Easing.linear,
            }),
        )

        translateX.value = withRepeat(cycle, -1, false)

        return () => cancelAnimation(translateX)
    }, [shouldAnimate, text, translateX])

    useEffect(() => () => cancelAnimation(translateX), [translateX])

    const movingStyle = useAnimatedStyle(() => ({
        transform: [{ translateX: translateX.value }],
    }))

    const handleContainerLayout = (event: LayoutChangeEvent) => {
        const width = event.nativeEvent.layout.width
        containerWidthRef.current = width
        setContainerWidth((previous) => previous === width ? previous : width)
    }

    const handleTextLayout = (event: { nativeEvent: { lines: readonly { width: number }[] } }) => {
        const width = event.nativeEvent.lines[0]?.width ?? 0
        contentWidthRef.current = width
        setContentWidth((previous) => Math.abs(previous - width) < 0.5 ? previous : width)
    }

    return (
        <View onLayout={handleContainerLayout} style={styles.container}>
            {shouldAnimate ? (
                <Animated.Text
                    key="moving"
                    numberOfLines={1}
                    ellipsizeMode="clip"
                    onTextLayout={handleTextLayout}
                    style={[style, animatedStyle, styles.movingText, { width: measuredWidthWithBuffer }, movingStyle]}
                >
                    {text}
                </Animated.Text>
            ) : (
                <Animated.Text
                    key="static"
                    numberOfLines={1}
                    ellipsizeMode="tail"
                    style={[style, animatedStyle, styles.staticText, styles.staticPosition]}
                >
                    {text}
                </Animated.Text>
            )}

            {!shouldAnimate && (
                <Animated.Text
                    accessible={false}
                    pointerEvents="none"
                    numberOfLines={1}
                    onTextLayout={handleTextLayout}
                    style={[style, animatedStyle, styles.measureText]}
                >
                    {text}
                </Animated.Text>
            )}
        </View>
    )
}

const styles = {
    container: {
        flex: 1,
        minWidth: 0,
        minHeight: 32,
        overflow: "hidden" as const,
        position: "relative" as const,
    },
    staticText: {
        flex: 1,
        minWidth: 0,
    },
    staticPosition: {
        transform: [{ translateX: 0 }],
    },
    movingText: {
        left: 0,
        position: "absolute" as const,
        top: 0,
    },
    measureText: {
        alignSelf: "flex-start" as const,
        left: 0,
        opacity: 0,
        position: "absolute" as const,
        top: 0,
        width: 10000,
    },
}
