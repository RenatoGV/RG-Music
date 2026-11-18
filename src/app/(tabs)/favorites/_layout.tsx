import { StackScreenWithSearchBar } from '@/constants/layout'
import { defaultStyles } from '@/styles'
import { Stack } from 'expo-router'
import { LiquidGlassBlurTarget } from '@/components/glass/LiquidGlassBlurTarget'

const FavoritesScreenLayout = () => {
  return (
    <LiquidGlassBlurTarget style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='index' options={{
                ...StackScreenWithSearchBar,
                headerTitle: 'Favoritos',
                headerTitleStyle: {
                  fontSize: 35
                },
            }} />
        </Stack>
    </LiquidGlassBlurTarget>
  )
}

export default FavoritesScreenLayout
