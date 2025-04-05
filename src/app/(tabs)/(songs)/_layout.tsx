import { StackScreenWithSearchBar } from '@/constants/layout'
import { useLibraryStore } from '@/store/library'
import { defaultStyles } from '@/styles'
import { Stack, useRouter } from 'expo-router'
import { TouchableOpacity, View } from 'react-native'
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { colors } from '@/constants/tokens'
import { useModalStore } from '@/store/modal'

const SongsScreenLayout = () => {
  const { tracks } = useLibraryStore()
  const { setModalFolderVisible } = useModalStore()

  return (
    <View style={defaultStyles.container}>
        <Stack>
            <Stack.Screen name='index' options={{
                ...StackScreenWithSearchBar,
                headerTitle: `Canciones${tracks ? ` (${tracks.length})` : '' }`,
                headerTitleStyle: {
                  fontSize: 35
                },
                headerTitleAlign: tracks ? 'center' : 'left',
                headerLeft: () =>(
                  tracks ?
                  <TouchableOpacity onPress={() => setModalFolderVisible(true)}>
                    <FontAwesome name="folder-o" size={22} color={colors.primary} />
                  </TouchableOpacity>
                  : null
                )
            }} />
        </Stack>
    </View>
  )
}

export default SongsScreenLayout