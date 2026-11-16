import { colors, fontSize } from "@/constants/tokens"
import { parseLRC } from "@/helpers/parseLRC"
import { useProgress } from "@/helpers/track-player-compat"
import { useFonts } from "expo-font"
import { useEffect, useMemo, useRef, useState } from "react"
import { Animated, Dimensions, NativeScrollEvent, NativeSyntheticEvent, ScrollView, ScrollViewInstance, View } from "react-native"

const SyncedLyricsView = ({ lyrics }: { lyrics: string }) => {
   const { position } = useProgress(250)
   const [autoPlayLineIndex, setAutoPlayLineIndex] = useState(0)
   const [scrollOffset, setScrollOffset] = useState(0)
   const [isUserScrolling, setIsUserScrolling] = useState(false)
   
   const lyricLines = useMemo(() => parseLRC(lyrics), [lyrics])
   const scrollViewRef = useRef<ScrollViewInstance | null>(null)
   const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
   const lastActiveIndexRef = useRef(0)
   const screenHeight = Dimensions.get('window').height
   const minLineHeight = 64
   const [viewportHeight, setViewportHeight] = useState(0)
   const [lineCenters, setLineCenters] = useState<Record<number, number>>({})
   const anchorY = Math.min(screenHeight / 3.5, viewportHeight / 2)
   const snapOffsets = useMemo(
      () => Object.values(lineCenters).map((center) => Math.max(0, center - anchorY)),
      [lineCenters, anchorY]
   )
   const activeCenter = lineCenters[autoPlayLineIndex]
   const activeOffset = activeCenter === undefined
      ? undefined
      : Math.max(0, activeCenter - anchorY)

   const [animatedScales, setAnimatedScales] = useState<Animated.Value[]>([])

   useEffect(() => {
      const activeIndex = lyricLines.findIndex(
         (line, index) => {
         const nextLine = lyricLines[index + 1]
         return line.time <= position && (nextLine ? position < nextLine.time : true)
         }
      )
      
      const validIndex = Math.max(0, activeIndex)
      
      if (validIndex !== lastActiveIndexRef.current) {
         lastActiveIndexRef.current = validIndex
         setAutoPlayLineIndex(validIndex)
      }
   }, [position, lyricLines])

   useEffect(() => {
      if (!isUserScrolling && viewportHeight > 0 && activeOffset !== undefined) {
         scrollViewRef.current?.scrollTo({
         y: activeOffset,
         animated: true
         })
      }
   }, [activeOffset, isUserScrolling, viewportHeight])

   useEffect(() => {
      return () => {
         if (scrollTimeoutRef.current) {
         clearTimeout(scrollTimeoutRef.current)
         }
      }
   }, [])

   const handleScrollBeginDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (scrollTimeoutRef.current) {
         clearTimeout(scrollTimeoutRef.current)
      }
      setScrollOffset(event.nativeEvent.contentOffset.y)
      setIsUserScrolling(true)
   }

   const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
      if (isUserScrolling) setScrollOffset(event.nativeEvent.contentOffset.y)
   }

   const handleScrollEndDrag = () => {
      if (scrollTimeoutRef.current) {
         clearTimeout(scrollTimeoutRef.current)
      }

      scrollTimeoutRef.current = setTimeout(() => {
         setIsUserScrolling(false)
      }, 1000)
   }

   const hasMeasuredLines = lyricLines.length > 0 && snapOffsets.length === lyricLines.length
   let activeLineIndex = autoPlayLineIndex

   if (isUserScrolling && hasMeasuredLines) {
      let closestDistance = Infinity
      snapOffsets.forEach((offset, index) => {
         const distance = Math.abs(offset - scrollOffset)
         if (distance < closestDistance) {
         closestDistance = distance
         activeLineIndex = index
         }
      })
   }

   useEffect(() => {
      if (!animatedScales.length) return

      animatedScales.forEach((anim, index) => {
         const distance = Math.abs(index - activeLineIndex)

         let targetScale = 1
         if (distance === 1) {
         targetScale = 0.8
         } else if (distance >= 2) {
         targetScale = 0.55
         }

         Animated.spring(anim, {
         toValue: targetScale,
         useNativeDriver: true,
         speed: 20,
         bounciness: 6
         }).start()
      })
   }, [activeLineIndex, animatedScales])

   const getLineStyles = (distanceFromActive: number) => {
      const distance = Math.abs(distanceFromActive)
      let opacityValue = 0.3

      if (distance === 0) {
         opacityValue = 1
      } else if (distance === 1) {
         opacityValue = 0.65
      } else if (distance === 2) {
         opacityValue = 0.4
      }

      return {
         opacityValue
      }
   }

   useEffect(() => {
      setAnimatedScales(
         lyricLines.map(() => new Animated.Value(1))
      )
   }, [lyricLines])

   const [fontsLoaded] = useFonts({
      LibertineBold: require('@/assets/fonts/LinLibertine_RB.ttf'),
   })

   return (
      <View style={{ flex: 1 }}>
         <ScrollView
         ref={scrollViewRef}
         onLayout={({ nativeEvent }) => setViewportHeight(nativeEvent.layout.height)}
         scrollEventThrottle={16}
         onScrollBeginDrag={handleScrollBeginDrag}
         onScroll={handleScroll}
         onScrollEndDrag={handleScrollEndDrag}
         showsVerticalScrollIndicator={false}
         scrollEnabled={true}
         snapToOffsets={hasMeasuredLines ? snapOffsets : undefined}
         snapToStart={false}
         snapToEnd={false}
         decelerationRate="fast"
         >
         <View style={{ height: Math.max(0, anchorY - minLineHeight / 2) }} />
         {lyricLines.map((line, index) => {
            const distanceFromActive = index - activeLineIndex
            const { opacityValue } = getLineStyles(distanceFromActive)
            const isVisible = Math.abs(distanceFromActive) <= 2

            return (
               <View
               key={`${line.time}-${line.content}`}
               accessibilityElementsHidden={!isVisible}
               importantForAccessibility={isVisible ? 'auto' : 'no-hide-descendants'}
               onLayout={({ nativeEvent: { layout } }) => {
                  const center = layout.y + layout.height / 2
                  setLineCenters((previous) => previous[index] === center
                     ? previous
                     : { ...previous, [index]: center })
               }}
               style={{
                  minHeight: minLineHeight,
                  paddingVertical: 20,
                  justifyContent: 'center',
                  opacity: isVisible ? opacityValue : 0
               }}
               >
               <Animated.Text
                  numberOfLines={4}
                  style={{
                     fontFamily: fontsLoaded ? 'LibertineBold' : undefined,
                     color: colors.text,
                     fontSize: line.content === '♪' ? fontSize.xl * 2 : fontSize.xl,
                     fontWeight: '700',
                     textAlign: 'center',
                     opacity: opacityValue,
                     transform: [{ scale: animatedScales[index] ?? 1 }]
                  }}
               >
                  {line.content}
               </Animated.Text>
               </View>
            )
         })}
         <View style={{ height: Math.max(0, viewportHeight - anchorY - minLineHeight / 2) }} />
         </ScrollView>
      </View>
      
   )
   }

export default SyncedLyricsView