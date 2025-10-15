import { PlaylistList } from '@/components/playlist/PlaylistList'
import { Playlist } from '@/helpers/types'
import { useTracks } from '@/store/library'
import { useQueue } from '@/store/queue'
import { useLocalSearchParams, useRouter } from 'expo-router'
import TrackPlayer, { Track } from 'react-native-track-player'
import { StyleSheet, View } from 'react-native'
import { defaultStyles } from '@/styles'
import { screenPadding } from '@/constants/tokens'
import { usePlaylistStore } from '@/store/playlist'
import { showToast } from '@/helpers/toast'

const addToPlaylistModal = () => {
    const router = useRouter()
    const { activeQueueId } = useQueue()

    const { trackUrl } = useLocalSearchParams<{ trackUrl: [Track['url']] }>()

    const tracks = useTracks()

    const { playlists, addToPlaylist } = usePlaylistStore()

    const track = tracks?.find((currentTrack) => trackUrl.toString() === currentTrack.url)

    if(!track) {
        return null
    }

    const availablePlaylists = playlists?.filter(
        (playlist) => !playlist.tracksUri.some((playlistTrack) => playlistTrack === track.url)
    )

    const handlePlaylistPress = async(playlist: Playlist) => {
        addToPlaylist(track.url, playlist)

        router.dismiss()

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