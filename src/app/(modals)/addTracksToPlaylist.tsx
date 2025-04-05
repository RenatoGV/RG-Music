import { useTracks } from '@/store/library'
import { Stack, useLocalSearchParams } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
// import { useHeaderHeight } from '@react-native-menu/elements'
import { StyleSheet, View } from 'react-native'
import { defaultStyles } from '@/styles'
import { colors, screenPadding } from '@/constants/tokens'
import { usePlaylistStore } from '@/store/playlist'
import { SelectTrackList } from '@/components/playlist/SelectTrackList'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { useMemo } from 'react'
import { trackTitleFilter } from '@/helpers/filter'

const addTracksToPlaylistModal = () => {
   const { playlist : playlistName } = useLocalSearchParams<{ playlist: string }>()

   const tracks = useTracks()
   const { playlists } = usePlaylistStore()

   const search = useNavigationSearch({
      searchBarOptions: {
         hideWhenScrolling: true,
         placeholder: 'Buscar Canción',
         textColor: '#fff',
         tintColor: '#fff',
         barTintColor: '#fff',
         hintTextColor: '#fff',
         headerIconColor: '#fff'
      }
   })

   const currentPlaylist = playlists?.find((playlist) => playlist.name === playlistName )

   const availableTracks = tracks?.filter(
      (track) => !currentPlaylist?.tracksUri.some((trackItem) => track.url === trackItem)
   )

   const filteredTracks = useMemo(() => {
         if(!availableTracks) return []

         return availableTracks.filter(trackTitleFilter(search))
       }, [availableTracks, search])

  return (
    <View style={[styles.modalContainer]}>
      <Stack.Screen options={{ headerTitle: `Agregar a ${playlistName}` }} />
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

export default addTracksToPlaylistModal