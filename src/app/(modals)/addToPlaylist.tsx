import { PlaylistList } from '@/components/playlist/PlaylistList'
import { Playlist } from '@/helpers/types'
import { useTracks } from '@/store/library'
import { useQueue } from '@/store/queue'
import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import TrackPlayer from '@/helpers/track-player-compat'
import { StyleSheet, View } from 'react-native'
import { defaultStyles } from '@/styles'
import { usePlaylistStore } from '@/store/playlist'
import { showToast } from '@/helpers/toast'
import { filterPlaylistsByName } from '@/helpers/filter'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useState } from 'react'
import { LinearGradient } from 'expo-linear-gradient'
import { ScreenHeader } from '@/components/common/ScreenHeader'

const AddToPlaylistModal = () => {
    const router = useRouter()
    const insets = useSafeAreaInsets()
    const [search, setSearch] = useState('')

    const { activeQueueId } = useQueue()

    const { trackUrl } = useLocalSearchParams<{ trackUrl: string }>()

    const tracks = useTracks()

    const { playlists, addToPlaylist } = usePlaylistStore()

    const track = tracks?.find((currentTrack) => trackUrl === decodeURIComponent(currentTrack.url))

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
        <View style={defaultStyles.container}>
			<Stack.Screen options={{ headerShown: false }} />
            <ScreenGradient />
            <ScreenHeader
                title="Playlist"
                subtitle={"Agregar a Playlist"}
                onBackPress={() => router.dismiss()}
                backAccessibilityLabel="Volver a la playlist"
                searchValue={search}
                onSearchChange={setSearch}
                searchPlaceholder="Buscar canciones"
                topInset={insets.top}
            />
            <PlaylistList playlists={filteredPlaylists} onPlaylistPress={handlePlaylistPress} />
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

export default AddToPlaylistModal
