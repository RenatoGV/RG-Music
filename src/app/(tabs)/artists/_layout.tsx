import { defaultStyles } from '@/styles'
import { Stack } from 'expo-router'
import { LiquidGlassBlurTarget } from '@/components/glass/LiquidGlassBlurTarget'

const ArtistsScreenLayout = () => {
  return (
    <LiquidGlassBlurTarget style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='index' options={{ headerShown: false }} />

            <Stack.Screen name='[name]' options={{ headerShown: false }} />
        </Stack>
    </LiquidGlassBlurTarget>
  )
}

export default ArtistsScreenLayout
