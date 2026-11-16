import { useEffect, useRef } from "react"
import { Animated, PanResponder } from "react-native"

interface UseFloatingPlayerSwipeParams {
   onOpen: () => void
   onDismiss: () => void
}

export function useFloatingPlayerSwipe({ onOpen, onDismiss }: Readonly<UseFloatingPlayerSwipeParams>) {
   const translateX = useRef(new Animated.Value(0)).current
   const callbacksRef = useRef({ onOpen, onDismiss })

   useEffect(() => {
      callbacksRef.current = { onOpen, onDismiss }
   }, [onOpen, onDismiss])

   const panResponder = useRef(
      PanResponder.create({
         onStartShouldSetPanResponder: () => true,

         onPanResponderMove: (_, gestureState) => {
            translateX.setValue(gestureState.dx);
         },

         onPanResponderRelease: (_, gestureState) => {
            if (Math.abs(gestureState.dx) > 150) {
               Animated.timing(translateX, {
                  toValue: gestureState.dx > 0 ? 500 : -500,
                  duration: 200,
                  useNativeDriver: true
               }).start(() => {
                  callbacksRef.current.onDismiss()
                  translateX.setValue(0)
               })

               return
            }

            if (Math.abs(gestureState.dx) < 5 && Math.abs(gestureState.dy) < 5) {
               callbacksRef.current.onOpen()
            }

            Animated.spring(translateX, {
               toValue: 0,
               useNativeDriver: true
            }).start()
         },
      })
   ).current

   return {
      translateX,
      panHandlers: panResponder.panHandlers,
   }
}