import { useSafeAreaInsets } from 'react-native-safe-area-context'

const BASE_TAB_CONTENT_BOTTOM_PADDING = 145

export function useTabContentBottomPadding() {
   const insets = useSafeAreaInsets()
   return BASE_TAB_CONTENT_BOTTOM_PADDING + insets.bottom
}