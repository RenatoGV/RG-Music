import { PlaylistTracksList } from '@/components/playlist/PlaylistTracksList'
import { screenPadding } from '@/constants/tokens'
import { usePlaylistStore } from '@/store/playlist'
import { defaultStyles } from '@/styles'
import { Redirect, Stack, useLocalSearchParams } from 'expo-router'
import { View } from 'react-native'

const PlaylistScreen = () => {
    const { id } = useLocalSearchParams<{ id: string }>()
    const { playlists } = usePlaylistStore()

    const playlist = playlists?.find((playlists) => playlists.id === id)

    if(!playlist) {
        console.warn(`Playlist ${id} was not found!`)

        return <Redirect href={'/(tabs)/playlists'} />
    }

    return (
        <View style={[defaultStyles.container, { paddingHorizontal: screenPadding.horizontal }]}>
            <Stack.Screen options={{ headerTitle: playlist.name }}/>
            <PlaylistTracksList playlist={playlist} />
        </View>
    )
}

export default PlaylistScreen