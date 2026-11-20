import { LiquidGlassButton } from '@/components/common/LiquidGlassButton'
import { colors, screenPadding } from '@/constants/tokens'
import { Ionicons } from '@expo/vector-icons'
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import {
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native'
import { useEffect, useRef, useState } from 'react'
import type { ComponentRef, ReactNode, RefObject } from 'react'

type ScreenHeaderProps = {
  title?: string
  subtitle?: string
  onBackPress?: () => void
  onOtherActionPress?: () => void
  onOtherActionIcon?: ReactNode
  otherActionAnchorRef?: RefObject<ComponentRef<typeof View> | null>
  otherActionAccessibilityLabel?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  searchExpanded?: boolean
  onSearchOpenChange?: (open: boolean) => void
  searchPlaceholder?: string
  backAccessibilityLabel?: string
  topInset?: number
}

const BUTTON_SIZE = 36
const EXPANDED_SEARCH_HEIGHT = 60
const SPACER_SIZE = 12
const EXPANDED_SEARCH_ICON_SLOT = 48
const SEARCH_CLOSE_SLOT = 40

export const ScreenHeader = ({
  title,
  subtitle,
  onBackPress,
  onOtherActionPress,
  onOtherActionIcon,
  otherActionAnchorRef,
  otherActionAccessibilityLabel = 'Acción adicional',
  searchValue = '',
  onSearchChange,
  searchExpanded,
  onSearchOpenChange,
  searchPlaceholder = 'Buscar',
  backAccessibilityLabel = 'Volver',
  topInset = 0,
}: ScreenHeaderProps) => {
  const { width: screenWidth } = useWindowDimensions()
  const [internalSearchOpen, setInternalSearchOpen] = useState(false)
  const searchOpen = searchExpanded ?? internalSearchOpen
  const searchProgress = useSharedValue(0)
  const inputRef = useRef<ComponentRef<typeof TextInput> | null>(null)

  const hasText = Boolean(title || subtitle)
  const hasBackButton = Boolean(onBackPress)
  const hasOtherActionButton = Boolean(onOtherActionPress)
  const hasSearchButton = Boolean(onSearchChange)
  const availableWidth = screenWidth - screenPadding.horizontal * 2
  const closedButtonCount = Number(hasBackButton) + Number(hasOtherActionButton) + Number(hasSearchButton)
  const closedItemCount = closedButtonCount + Number(hasText)
  const titleWidth = Math.max(
    0,
    availableWidth - closedButtonCount * BUTTON_SIZE - Math.max(0, closedItemCount - 1) * SPACER_SIZE,
  )
  const inputWidth = availableWidth - EXPANDED_SEARCH_ICON_SLOT - SEARCH_CLOSE_SLOT

  const updateSearchOpen = (open: boolean) => {
    if (searchExpanded === undefined) setInternalSearchOpen(open)
    onSearchOpenChange?.(open)
  }

  const backAnimatedStyle = useAnimatedStyle(() => ({
    width: BUTTON_SIZE * (1 - searchProgress.value),
    opacity: 1 - searchProgress.value,
  }))
  const otherActionAnimatedStyle = useAnimatedStyle(() => ({
    width: BUTTON_SIZE * (1 - searchProgress.value),
    opacity: 1 - searchProgress.value,
  }))
  const titleAnimatedStyle = useAnimatedStyle(() => ({
    width: titleWidth * (1 - searchProgress.value),
    opacity: 1 - searchProgress.value,
  }), [titleWidth])
  const firstSpacerAnimatedStyle = useAnimatedStyle(() => ({
    width: SPACER_SIZE * (1 - searchProgress.value),
  }))
  const secondSpacerAnimatedStyle = useAnimatedStyle(() => ({
    width: SPACER_SIZE * (1 - searchProgress.value),
  }))
  const thirdSpacerAnimatedStyle = useAnimatedStyle(() => ({
    width: SPACER_SIZE * (1 - searchProgress.value),
  }))
  const searchAnimatedStyle = useAnimatedStyle(() => ({
    width: BUTTON_SIZE + (availableWidth - BUTTON_SIZE) * searchProgress.value,
    height: BUTTON_SIZE + (EXPANDED_SEARCH_HEIGHT - BUTTON_SIZE) * searchProgress.value,
  }), [availableWidth])
  const inputAnimatedStyle = useAnimatedStyle(() => ({
    width: inputWidth * searchProgress.value,
    opacity: searchProgress.value,
  }), [inputWidth])
  const iconSlotAnimatedStyle = useAnimatedStyle(() => ({
    width: BUTTON_SIZE + (EXPANDED_SEARCH_ICON_SLOT - BUTTON_SIZE) * searchProgress.value,
  }))
  const closeAnimatedStyle = useAnimatedStyle(() => ({
    width: SEARCH_CLOSE_SLOT * searchProgress.value,
    opacity: searchProgress.value,
  }))

  useEffect(() => {
    searchProgress.value = withTiming(searchOpen ? 1 : 0, {
      duration: searchOpen ? 280 : 240,
      easing: Easing.inOut(Easing.cubic),
    })
  }, [searchOpen, searchProgress])

  useEffect(() => {
    if (!searchOpen) return
    const timeout = setTimeout(() => {
      TextInput.State.focusTextInput(inputRef.current?.getNativeRef())
    }, 120)
    return () => clearTimeout(timeout)
  }, [searchOpen])

  const openSearch = () => {
    updateSearchOpen(true)
  }

  const closeSearch = () => {
    Keyboard.dismiss()
    onSearchChange?.('')
    updateSearchOpen(false)
  }

  return (
    <View style={[styles.header, { paddingTop: topInset + 18 }]}>
      {hasBackButton && (
        <Animated.View
          style={[styles.buttonWrap, backAnimatedStyle]}
          pointerEvents={searchOpen ? 'none' : 'auto'}
          accessibilityElementsHidden={searchOpen}
          importantForAccessibility={searchOpen ? 'no-hide-descendants' : 'auto'}
        >
          <LiquidGlassButton
            accessibilityLabel={backAccessibilityLabel}
            onPress={onBackPress}
            style={styles.actionButton}
          >
            <Ionicons name="chevron-back" size={16} color={colors.text} />
          </LiquidGlassButton>
        </Animated.View>
      )}

      {hasBackButton && hasText && <Animated.View style={[styles.spacer, firstSpacerAnimatedStyle]} />}

      {hasText && (
        <Animated.View
          style={[styles.titleBlock, titleAnimatedStyle]}
          accessibilityElementsHidden={searchOpen}
          importantForAccessibility={searchOpen ? 'no-hide-descendants' : 'auto'}
        >
          {title ? <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>{title}</Text> : null}
          {subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
              {subtitle}
            </Text>
          ) : null}
        </Animated.View>
      )}

      {!hasText && hasSearchButton && <View style={styles.flexSpacer} />}

      {hasText && hasSearchButton && <Animated.View style={[styles.spacer, secondSpacerAnimatedStyle]} />}

      {hasSearchButton && (
        <Animated.View style={[styles.searchButtonWrap, searchAnimatedStyle]}>
          <LiquidGlassButton
            accessibilityLabel={searchOpen ? 'Cerrar búsqueda' : 'Buscar canciones'}
            accessibilityRole="button"
            onPress={searchOpen ? undefined : openSearch}
            style={styles.searchButton}
          >
            <View style={styles.searchContent}>
              <Animated.View style={[styles.searchIconSlot, iconSlotAnimatedStyle]}>
                <Ionicons name="search" size={16} color={colors.text} />
              </Animated.View>
              <Animated.View style={[styles.inputWrap, inputAnimatedStyle]}>
                <TextInput
                  ref={inputRef}
                  value={searchValue}
                  onChangeText={onSearchChange}
                  editable={searchOpen}
                  placeholder={searchPlaceholder}
                  placeholderTextColor={colors.textMuted}
                  selectionColor={colors.primary}
                  autoCapitalize="none"
                  returnKeyType="search"
                  style={styles.searchInput}
                />
              </Animated.View>
              <Animated.View style={[styles.closeButtonWrap, closeAnimatedStyle]}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar búsqueda"
                  onPress={closeSearch}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={18} color={colors.text} />
                </Pressable>
              </Animated.View>
            </View>
          </LiquidGlassButton>
        </Animated.View>
      )}

      {(hasBackButton || hasText || hasSearchButton) && hasOtherActionButton && (
        <Animated.View style={[styles.spacer, thirdSpacerAnimatedStyle]} />
      )}

      {hasOtherActionButton && (
        <Animated.View
          ref={otherActionAnchorRef}
          collapsable={false}
          style={[styles.buttonWrap, otherActionAnimatedStyle]}
          pointerEvents={searchOpen ? 'none' : 'auto'}
          accessibilityElementsHidden={searchOpen}
          importantForAccessibility={searchOpen ? 'no-hide-descendants' : 'auto'}
        >
          <LiquidGlassButton
            accessibilityLabel={otherActionAccessibilityLabel}
            onPress={onOtherActionPress}
            style={styles.actionButton}
          >
            {onOtherActionIcon ?? <Ionicons name="folder-outline" size={16} color={colors.text} />}
          </LiquidGlassButton>
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: screenPadding.horizontal,
    paddingBottom: 22,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleBlock: {
    overflow: 'hidden',
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontWeight: '700',
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    marginTop: 2,
  },
  spacer: {
    flexShrink: 0,
  },
  flexSpacer: {
    flex: 1,
  },
  buttonWrap: {
    height: BUTTON_SIZE,
    overflow: 'hidden',
  },
  actionButton: {
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonWrap: {
    height: BUTTON_SIZE,
    flexShrink: 0,
  },
  searchButton: {
    width: '100%',
    height: '100%',
    borderRadius: 999,
  },
  searchContent: {
    flex: 1,
    height: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchIconSlot: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputWrap: {
    height: '100%',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  searchInput: {
    width: '100%',
    color: colors.text,
    fontSize: 16,
    paddingVertical: 0,
  },
  closeButtonWrap: {
    height: '100%',
    overflow: 'hidden',
  },
  closeButton: {
    width: SEARCH_CLOSE_SLOT,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
