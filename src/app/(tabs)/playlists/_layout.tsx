import { StackScreenWithSearchBar } from '@/constants/layout'
import { colors, fontSize } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { Stack, useLocalSearchParams } from 'expo-router'
import { TouchableOpacity, View } from 'react-native'
import { FontAwesome6 } from "@expo/vector-icons"
import { useModalStore } from '@/store/modal'

const PlaylistsScreenLayout = () => {
  const { setModalVisible } = useModalStore()

  return (
    <View style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='index' options={{
                ...StackScreenWithSearchBar,
                headerTitle: 'Playlists',
                headerTitleStyle: {
                  fontSize: 35
                },
                headerTitleAlign: 'center',
                headerLeft: () =>(
                  <TouchableOpacity onPress={() => setModalVisible(true)}>
                    <FontAwesome6 name="plus" size={22} color={colors.primary} />
                  </TouchableOpacity>
                )
            }} />
            <Stack.Screen name='[name]' options={{
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