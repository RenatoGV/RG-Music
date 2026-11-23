import { LiquidGlassBlurTarget } from '@/components/glass/LiquidGlassBlurTarget'
import { defaultStyles } from '@/styles'
import { Stack } from 'expo-router'

const DownloadScreenLayout = () => (
  <LiquidGlassBlurTarget style={defaultStyles.container}>
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
    </Stack>
  </LiquidGlassBlurTarget>
)

export default DownloadScreenLayout
