import { StackScreenWithSearchBar } from '@/constants/layout'
import { colors, fontSize } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { Stack } from 'expo-router'
import { View } from 'react-native'

const PlaylistsScreenLayout = () => {
  return (
    <View style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='index' options={{
                ...StackScreenWithSearchBar,
                headerTitle: 'Playlists',
                headerTitleStyle: {
                  fontSize: 35
                },
                headerTitleAlign: 'center'
            }} />
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
    </View>
  )
}

export default PlaylistsScreenLayout