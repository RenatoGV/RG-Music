import { PlaylistList } from '@/components/playlist/PlaylistList'
import { filterPlaylistsByName } from '@/helpers/filter'
import { Playlist } from '@/helpers/types'
import { defaultStyles } from '@/styles'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { usePlaylistStore } from '@/store/playlist'
import { showToast } from '@/helpers/toast'
import CreatePlaylistModal from '@/components/modals/CreatePlaylistModal'
import { LinearGradient } from 'expo-linear-gradient'
import { ScreenHeader } from '@/components/common/ScreenHeader'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Ionicons } from '@expo/vector-icons'

const PlaylistsScreen = () => {
   const insets = useSafeAreaInsets()
   const [search, setSearch] = useState('')
   const router = useRouter()


   const [modalVisible, setModalVisible] = useState(false)
   const { playlists, addPlaylist } = usePlaylistStore()

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
      <View style={defaultStyles.container}>
			<ScreenGradient />
         <CreatePlaylistModal
            visible={modalVisible}
            onClose={() => setModalVisible(false)}
            onCreate={handleCreatePlaylist}
         />
         <ScreenHeader
            title="Playlists"
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar Playlist"
            onOtherActionPress={() => setModalVisible(true)}
            onOtherActionIcon={<Ionicons name="add" size={20} color="#fff" />}
            otherActionAccessibilityLabel="Crear playlist"
            topInset={insets.top}
         />
         <PlaylistList
            playlists={filteredPlaylists}
            onPlaylistPress={handlePlaylistPress}
            emptyStateTitle={sortedPlaylists.length === 0 ? 'Aún no tienes playlists' : 'No hay playlists que coincidan'}
            emptyStateDescription={sortedPlaylists.length === 0
               ? 'Crea una playlist para organizar las canciones que te gustan.'
               : 'Prueba con otro nombre.'}
            contentInsetAdjustmentBehavior="automatic"
         />
      </View>
   )
}

const ScreenGradient = () => (
   <LinearGradient
      pointerEvents="none"
      colors={['#18553A', '#02181C', '#0E0E10']}
      locations={[0, 0.21, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={StyleSheet.absoluteFill}
   />
)

export default PlaylistsScreen
