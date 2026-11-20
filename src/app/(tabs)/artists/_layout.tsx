import { colors } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { Stack } from 'expo-router'
import { LiquidGlassBlurTarget } from '@/components/glass/LiquidGlassBlurTarget'

const ArtistsScreenLayout = () => {
  return (
    <LiquidGlassBlurTarget style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='index' options={{ headerShown: false }} />

            <Stack.Screen name='[name]' options={{
              headerTitle: '',
              headerBackVisible: true,
              headerStyle: {
                backgroundColor: colors.background
              },
              headerTintColor: colors.primary
            }} />
        </Stack>
    </LiquidGlassBlurTarget>
  )
}

export default ArtistsScreenLayout
