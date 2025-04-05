import { StackScreenWithSearchBar } from '@/constants/layout'
import { defaultStyles } from '@/styles'
import { Stack } from 'expo-router'
import { Text, View } from 'react-native'

const FavoritesScreenLayout = () => {
  return (
    <View style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='index' options={{
                ...StackScreenWithSearchBar,
                headerTitle: 'Favoritos',
                headerTitleStyle: {
                  fontSize: 35
                },
            }} />
        </Stack>
    </View>
  )
}

export default FavoritesScreenLayout