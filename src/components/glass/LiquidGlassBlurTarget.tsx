import React, { ComponentRef, Dispatch, PropsWithChildren, RefObject, SetStateAction, useCallback, useContext, useEffect, useRef } from "react"
import { BlurTargetView } from "expo-blur"
import { useFocusEffect } from "expo-router"
import { StyleProp, View, ViewStyle } from "react-native"

export type NativeViewRef = ComponentRef<typeof View>
export type LiquidGlassBlurTargetRef = RefObject<NativeViewRef | null> | null

type SetBlurTarget = Dispatch<SetStateAction<LiquidGlassBlurTargetRef>>

export const LiquidGlassBlurTargetContext = React.createContext<SetBlurTarget | null>(null)
export const LiquidGlassBlurTargetRefContext = React.createContext<LiquidGlassBlurTargetRef>(null)

type LiquidGlassBlurTargetProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>
}>

/** Marks the focused tab screen as the Android backdrop for the floating glass bar. */
export const LiquidGlassBlurTarget = ({ children, style }: LiquidGlassBlurTargetProps) => {
  const setSharedTarget = useContext(LiquidGlassBlurTargetContext)
  const targetRef = useRef<NativeViewRef | null>(null)

  useFocusEffect(useCallback(() => {
    if (!setSharedTarget) return
    setSharedTarget(targetRef)
  }, [setSharedTarget]))

  useEffect(() => () => {
    if (!setSharedTarget) return
    // Keep the last focused tab as the blur target while a transparent player
    // modal is animating over it. Clear it only when this target unmounts.
    setSharedTarget((current) => {
      if (current === targetRef) return null
      return current
    })
  }, [setSharedTarget])

  return <BlurTargetView ref={targetRef} style={style}>{children}</BlurTargetView>
}
