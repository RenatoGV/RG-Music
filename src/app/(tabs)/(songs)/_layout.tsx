import { StackScreenWithSearchBar } from '@/constants/layout'
import { useLibraryStore } from '@/store/library'
import { defaultStyles } from '@/styles'
import { Stack } from 'expo-router'
import { View } from 'react-native'

const SongsScreenLayout = () => {
  const { tracks } = useLibraryStore()

  return (
    <View style={defaultStyles.container}>
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
    </View>
  )
}

export default SongsScreenLayout
