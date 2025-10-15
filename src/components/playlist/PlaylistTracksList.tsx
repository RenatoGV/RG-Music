import { trackTitleFilter } from '@/helpers/filter'
import { Playlist } from '@/helpers/types'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { useMemo } from 'react'
import { generateTrackListId } from '@/helpers/miscellaneous'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { colors, fontSize } from '@/constants/tokens'
import FastImage from 'react-native-fast-image'
import { unknownPlaylistImageUri } from '@/constants/images'
import { QueueControls } from '../other/QueueControls'
import { TracksList } from '../track/TracksList'
import { FontAwesome6 } from "@expo/vector-icons"
import { useRouter } from 'expo-router'
import { useTracks } from '@/store/library'

export const PlaylistTracksList = ({playlist} : {playlist: Playlist}) => {
    const router = useRouter()

    const tracks = useTracks()

    const currentTracks = tracks?.filter((track) => playlist.tracksUri.includes(track.url))

    const search = useNavigationSearch({
        searchBarOptions: {
            hideWhenScrolling: true,
            placeholder: 'Buscar en Playlist'
        }
    })

    const handlePress = () => {
        router.push({pathname: '../../(modals)/addTracksToPlaylist', params: { playlist: playlist.name }})
    }

    const filteredPlaylistTracks = useMemo(() => {
        if(!currentTracks) return []

        return currentTracks?.filter(trackTitleFilter(search))
    }, [playlist.tracksUri, search])

    return (
        <TracksList
            id={generateTrackListId(playlist.name, search)}
            fromPlaylist={playlist}
            scrollEnabled={false}
            hideQueueControls={true}
            ListHeaderComponentStyle={styles.playlistHeaderContainer}
            ListHeaderComponent={
                <View>
                    <View style={styles.artworkImageContainer}>
                        <FastImage
                            source={{
                                uri: unknownPlaylistImageUri,
                                priority: FastImage.priority.high
                            }}
                            style={styles.artworkImage}
                        />
                    </View>
                    <View style={styles.addTracksContainer}>
                        <TouchableOpacity style={styles.addTracksButton} onPress={handlePress}>
                            <FontAwesome6 name="plus" size={22} color={colors.primary} />
                            <Text style={styles.addTracksText}>Agregar Canciones</Text>
                        </TouchableOpacity>
                    </View>

                    {search.length === 0 && (
                        <QueueControls style={{paddingTop: 24}} tracks={currentTracks || []} />
                    )}
                </View>
            }
            tracks={filteredPlaylistTracks}
        />
    )
}

const styles = StyleSheet.create({
	playlistHeaderContainer: {
		flex: 1,
		marginBottom: 32,
	},
	artworkImageContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		height: 300,
	},
	artworkImage: {
		width: '85%',
		height: '100%',
		resizeMode: 'cover',
		borderRadius: 12,
	},
    addTracksContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
		marginTop: 22,
    },
    addTracksButton: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        padding: 5
    },
	addTracksText: {
        color: colors.primary,
        fontSize: fontSize.lg,
		fontWeight: 'bold',
	},
})