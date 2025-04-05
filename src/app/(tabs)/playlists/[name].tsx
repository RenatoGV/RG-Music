import { PlaylistTracksList } from '@/components/playlist/PlaylistTracksList'
import { screenPadding } from '@/constants/tokens'
import { usePlaylistStore } from '@/store/playlist'
import { defaultStyles } from '@/styles'
import { Redirect, Stack, useLocalSearchParams } from 'expo-router'
import { ScrollView, View } from 'react-native'

const PlaylistScreen = () => {
    const { name: playlistName } = useLocalSearchParams<{name: string}>()

    const { playlists } = usePlaylistStore()

    const playlist = playlists?.find((playlists) => playlists.name === playlistName)

    if(!playlist) {
        console.warn(`Playlist ${playlistName} was not found!`)

        return <Redirect href={'/(tabs)/playlists'} />
    }

    return (
        <View style={defaultStyles.container}>
            <Stack.Screen options={{ headerTitle: playlistName }}/>
            <ScrollView
                contentInsetAdjustmentBehavior='automatic'
                style={{ paddingHorizontal: screenPadding.horizontal }}
            >
                <PlaylistTracksList playlist={playlist} />
            </ScrollView>
        </View>
    )
}

export default PlaylistScreen