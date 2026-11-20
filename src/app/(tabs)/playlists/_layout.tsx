import { colors, fontSize } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { Stack } from 'expo-router'
import { LiquidGlassBlurTarget } from '@/components/glass/LiquidGlassBlurTarget'

const PlaylistsScreenLayout = () => {
  return (
    <LiquidGlassBlurTarget style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='index' options={{ headerShown: false }} />
            <Stack.Screen name='[id]' options={{
                headerBackVisible: true,
                headerTitleAlign: 'center',
                headerStyle: {
                  backgroundColor: colors.background
                },
                headerTitleStyle: {
                  color: '#FFF',
                  fontWeight: '800',
                  fontSize: fontSize.lg
                },
                headerTintColor: colors.primary
            }} />
        </Stack>
    </LiquidGlassBlurTarget>
  )
}

export default PlaylistsScreenLayout
