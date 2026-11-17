import { PlaylistList } from '@/components/playlist/PlaylistList'
import { Playlist } from '@/helpers/types'
import { useTracks } from '@/store/library'
import { useQueue } from '@/store/queue'
import { useLocalSearchParams, useRouter } from 'expo-router'
import TrackPlayer from '@/helpers/track-player-compat'
import { StyleSheet, View } from 'react-native'
import { defaultStyles } from '@/styles'
import { screenPadding } from '@/constants/tokens'
import { usePlaylistStore } from '@/store/playlist'
import { showToast } from '@/helpers/toast'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { filterPlaylistsByName } from '@/helpers/filter'

const AddToPlaylistModal = () => {
    const router = useRouter()

    const { activeQueueId } = useQueue()

    const { trackUrl } = useLocalSearchParams<{ trackUrl: string }>()

    const tracks = useTracks()

    const { playlists, addToPlaylist } = usePlaylistStore()

    const track = tracks?.find((currentTrack) => trackUrl === decodeURIComponent(currentTrack.url))

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

    if(!track) {
        return null
    }

    const availablePlaylists = playlists?.filter(
        (playlist) => !playlist.tracksUri.includes(track.url)
    )

    const filteredPlaylists = filterPlaylistsByName(availablePlaylists ?? [], search)

    const handlePlaylistPress = (playlist: Playlist) => {
        addToPlaylist(track.url, playlist.id)

        router.dismiss()

        if(activeQueueId === `playlist:${playlist.id}`){
            TrackPlayer.getQueue().some((item) => item.url === track.url)
            TrackPlayer.add(track)
        }

        showToast(`Agregado a ${playlist.name}`)
    }

    return (
        <View style={[styles.modalContainer, {paddingTop: 10}]}>
            <PlaylistList playlists={filteredPlaylists} onPlaylistPress={handlePlaylistPress} />
        </View>
    )
}

const styles = StyleSheet.create({
    modalContainer: {
        ...defaultStyles.container,
        paddingHorizontal: screenPadding.horizontal
    }
})

export default AddToPlaylistModal
