import { useEffect, useRef, useState } from "react"
import { NativeScrollEvent, NativeSyntheticEvent, ScrollViewInstance } from "react-native"

interface UseLyricsAutoScrollParams {
   activeOffset: number | undefined
   viewportHeight: number
   enabled?: boolean
   onInitialPositioned?: () => void
}

export function useLyricsAutoScroll({ activeOffset, viewportHeight, enabled = true, onInitialPositioned }: Readonly<UseLyricsAutoScrollParams>) {
   const scrollViewRef = useRef<ScrollViewInstance | null>(null)
   const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
   const hasInitialPositionedRef = useRef(false)
   const [scrollOffset, setScrollOffset] = useState(0)
   const [isUserScrolling, setIsUserScrolling] = useState(false)

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

   useEffect(() => {
      if (!enabled || isUserScrolling || viewportHeight <= 0 || activeOffset === undefined) return

      const isInitialPosition = !hasInitialPositionedRef.current
      if (isInitialPosition) hasInitialPositionedRef.current = true

      scrollViewRef.current?.scrollTo({
         y: activeOffset,
         animated: !isInitialPosition
      })

      if (isInitialPosition && onInitialPositioned) {
         requestAnimationFrame(onInitialPositioned)
      }
   }, [activeOffset, enabled, isUserScrolling, onInitialPositioned, viewportHeight])

   useEffect(() => {
      return () => {
         if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current)
         }
      }
   }, [])

   return {
      scrollViewRef,
      scrollOffset,
      isUserScrolling,
      handleScrollBeginDrag,
      handleScroll,
      handleScrollEndDrag,
   }
}
