import { PlaylistList } from '@/components/playlist/PlaylistList'
import { colors, screenPadding } from '@/constants/tokens'
import { filterPlaylistsByName } from '@/helpers/filter'
import { Playlist } from '@/helpers/types'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { defaultStyles } from '@/styles'
import { useNavigation, useRouter } from 'expo-router'
import { useLayoutEffect, useMemo, useState } from 'react'
import { TouchableOpacity, View } from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import { usePlaylistStore } from '@/store/playlist'
import { showToast } from '@/helpers/toast'
import CreatePlaylistModal from '@/components/modals/CreatePlaylistModal'

const PlaylistsScreen = () => {
   const navigation = useNavigation()
   const router = useRouter()

   const search = useNavigationSearch({
      searchBarOptions: {
         placeholder: 'Buscar en Playlist',
         shouldShowHintSearchIcon: false
      },
   })

   const [modalVisible, setModalVisible] = useState(false)
   const { playlists, addPlaylist } = usePlaylistStore()

   useLayoutEffect(() => {
      navigation.setOptions({
         headerLeft: () => (
            <TouchableOpacity
               accessibilityLabel="Crear playlist"
               onPress={() => setModalVisible(true)}
            >
               <FontAwesome6 name="plus" size={22} color={colors.primary} />
            </TouchableOpacity>
         ),
      })
   }, [navigation])

   const sortedPlaylists = useMemo(
      () => [...(playlists ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
      [playlists]
   )

   const filteredPlaylists = filterPlaylistsByName(sortedPlaylists, search)

   const handlePlaylistPress = (playlist: Playlist) => {
      router.push({
         pathname: '/(tabs)/playlists/[id]',
         params: { id: playlist.id },
      })
   }

   const handleCreatePlaylist = (name: string) => {
      const created = addPlaylist(name)
      showToast(created ? `Playlist ${name} creada` : 'Ya existe una playlist con ese nombre')
      return created
   }

   return (
      <View style={[defaultStyles.container, { paddingHorizontal: screenPadding.horizontal }]}>
         <CreatePlaylistModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onCreate={handleCreatePlaylist}
         />
         <PlaylistList
            playlists={filteredPlaylists}
            onPlaylistPress={handlePlaylistPress}
            contentInsetAdjustmentBehavior="automatic"
         />
      </View>
   )
}

export default PlaylistsScreen