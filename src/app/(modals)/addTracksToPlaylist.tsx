import { useTracks } from '@/store/library'
import { Stack, useLocalSearchParams } from 'expo-router'
import { StyleSheet, View } from 'react-native'
import { defaultStyles } from '@/styles'
import { screenPadding } from '@/constants/tokens'
import { usePlaylistStore } from '@/store/playlist'
import { SelectTrackList } from '@/components/playlist/SelectTrackList'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { filterTrackByTitle } from '@/helpers/filter'

const AddTracksToPlaylistModal = () => {
   const { playlistId } = useLocalSearchParams<{ playlistId: string }>()

   const tracks = useTracks()
   const { playlists } = usePlaylistStore()

   const search = useNavigationSearch({
      searchBarOptions: {
         hideWhenScrolling: true,
         placeholder: 'Buscar canción',
         textColor: '#fff',
         tintColor: '#fff',
         barTintColor: '#fff',
         hintTextColor: '#fff',
         headerIconColor: '#fff'
      }
   })

   const currentPlaylist = playlists?.find((playlist) => playlist.id === playlistId )
   
   if (!currentPlaylist) return null

   const availableTracks = tracks?.filter(
      (track) => !currentPlaylist?.tracksUri.includes(track.url)
   )

   const filteredTracks = filterTrackByTitle(availableTracks ?? [], search)


   return (
      <View style={[styles.modalContainer]}>
         <Stack.Screen options={{ headerTitle: `Agregar a ${currentPlaylist.name}` }} />
         <SelectTrackList tracks={filteredTracks || []} playlist={currentPlaylist} />
      </View>
   )
}

const styles = StyleSheet.create({
   modalContainer: {
      ...defaultStyles.container,
      paddingHorizontal: screenPadding.horizontal
   }
})

export default AddTracksToPlaylistModal
