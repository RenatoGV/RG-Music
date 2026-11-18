import { StackScreenWithSearchBar } from '@/constants/layout'
import { useLibraryStore } from '@/store/library'
import { defaultStyles } from '@/styles'
import { Stack } from 'expo-router'
import { LiquidGlassBlurTarget } from '@/components/glass/LiquidGlassBlurTarget'

const SongsScreenLayout = () => {
  const { tracks } = useLibraryStore()

  return (
    <LiquidGlassBlurTarget style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='index' options={{
                ...StackScreenWithSearchBar,
                headerTitle: tracks ? `Canciones (${tracks.length})` : 'Canciones',
                headerTitleStyle: {
                  fontSize: 35
                },
                headerTitleAlign: tracks ? 'center' : 'left'
            }} />
        </Stack>
    </LiquidGlassBlurTarget>
  )
}

export default SongsScreenLayout
