import { PlaylistList } from '@/components/playlist/PlaylistList'
import { Playlist } from '@/helpers/types'
import { useTracks } from '@/store/library'
import { useQueue } from '@/store/queue'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView } from 'react-native-safe-area-context'
import TrackPlayer, { Track } from 'react-native-track-player'
// import { useHeaderHeight } from '@react-native-menu/elements'
import { StyleSheet, View } from 'react-native'
import { defaultStyles } from '@/styles'
import { screenPadding } from '@/constants/tokens'
import { usePlaylistStore } from '@/store/playlist'
import { showToast } from '@/helpers/toast'

const addToPlaylistModal = () => {
    const router = useRouter()
    // const headerHight = useHeaderHeight()
    const { activeQueueId } = useQueue()

    const { trackUrl } = useLocalSearchParams<{ trackUrl: [Track['url']] }>()

    const tracks = useTracks()

    const { playlists, addToPlaylist } = usePlaylistStore()

    const track = tracks?.find((currentTrack) => trackUrl.toString() === currentTrack.url)

    // Track was not found
    if(!track) {
        return null
    }

    const availablePlaylists = playlists?.filter(
        (playlist) => !playlist.tracksUri.some((playlistTrack) => playlistTrack === track.url)
    )

    const handlePlaylistPress = async(playlist: Playlist) => {
        addToPlaylist(track.url, playlist)

        // Should close the modal
        router.dismiss()

    // If the current queue is the playlist we're adding to, add the track at the end of the queue
        if(activeQueueId?.startsWith(playlist.name)){
            await TrackPlayer.add(track)
        }

        showToast(`Agregado a ${playlist.name}`)
    }

  return (
    <View style={[styles.modalContainer, {paddingTop: 10}]}>
        <PlaylistList playlists={availablePlaylists || []} onPlaylistPress={handlePlaylistPress} />
    </View>
  )
}

const styles = StyleSheet.create({
    modalContainer: {
        ...defaultStyles.container,
        paddingHorizontal: screenPadding.horizontal
    }
})

export default addToPlaylistModal