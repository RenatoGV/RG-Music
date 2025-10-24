import { trackTitleFilter } from '@/helpers/filter'
import { generateTrackListId } from '@/helpers/miscellaneous'
import { Artist } from '@/helpers/types'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { useMemo } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { unknownArtistImageUri } from '@/constants/images'
import { defaultStyles } from '@/styles'
import { fontSize } from '@/constants/tokens'
import { QueueControls } from './QueueControls'
import { TracksList } from '../track/TracksList'

export const ArtistTracksList = ({artist}: {artist: Artist}) => {
    const search = useNavigationSearch({
        searchBarOptions: {
            placeholder: 'Buscar en sus canciones',
      	    shouldShowHintSearchIcon: false
        }
    })

    const filteredArtistTracks = useMemo(() => {
        return artist.tracks.filter(trackTitleFilter(search))
    }, [artist.tracks, search])

    return <TracksList id={generateTrackListId(artist.name, search)} 
        hideQueueControls={true}
        ListHeaderComponentStyle={styles.artistHeaderContainer}
        ListHeaderComponent={
            <View>
                <View style={styles.artworkImageContainer}>
                    <FastImage
                        source={{
                            uri: unknownArtistImageUri,
                            priority: FastImage.priority.high
                        }}
                        style={styles.artistImage}
                    />
                </View>

                <Text numberOfLines={1} style={styles.artistNameText}>{artist.name}</Text>

                {artist.tracks.length > 0 && (
                    <QueueControls tracks={artist.tracks} style={{paddingTop: 24}} />
                )}
            </View>
        }
        tracks={artist.tracks}
        filteredTracks={filteredArtistTracks}
    />
}

const styles = StyleSheet.create({
    artistHeaderContainer: {
		flex: 1,
		marginBottom: 32,
	},
	artworkImageContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		height: 250,
	},
	artistImage: {
		width: '80%',
		height: '100%',
		resizeMode: 'center',
		borderRadius: 128,
	},
	artistNameText: {
		...defaultStyles.text,
		marginTop: 22,
		textAlign: 'center',
		fontSize: fontSize.lg,
		fontWeight: '800',
	},
})