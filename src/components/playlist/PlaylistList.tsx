import { unknownPlaylistImageUri } from '@/constants/images'
import { playlistsNameFilter } from '@/helpers/filter'
import { Playlist } from '@/helpers/types'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { utilsStyles } from '@/styles'
import { useMemo, useState } from 'react'
import { FlatList, FlatListProps, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { PlaylistListItem } from './PlaylistListItem'
import { DeletePlaylist } from '@/components/modals/DeletePlaylist'

type PlaylistsListProps = {
    playlists: Playlist[]
    onPlaylistPress: (playlist: Playlist) => void
} & Partial<FlatListProps<Playlist>>

const ItemDivider = () => {
	return <View style={{...utilsStyles.itemSeparator, marginLeft: 80, marginVertical: 12}} />
}

export const PlaylistList = ({playlists, onPlaylistPress: handlePlaylistPress, ...flatListProps} : PlaylistsListProps) => {
	const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)

    const search = useNavigationSearch({
        searchBarOptions: {
            placeholder: 'Buscar playlist'
        }
    })
	

    const filteredPlaylist = useMemo(() => {
        return playlists.filter(playlistsNameFilter(search))
    }, [playlists, search])

	const handlePlaylistLongPress = (playlist : Playlist) => {
		setSelectedPlaylist(playlist)
	}

	return (
		<View>
			<DeletePlaylist selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist} />
			<FlatList
				contentContainerStyle={{ paddingTop: 10, paddingBottom: 128 }}
				ItemSeparatorComponent={ItemDivider}
				// ListFooterComponent={ItemDivider}
				ListEmptyComponent={
					<View>
						<Text style={utilsStyles.emptyContentText}>No se encontraron Playlist</Text>

						<FastImage
							source={{ uri: unknownPlaylistImageUri, priority: FastImage.priority.normal }}
							style={utilsStyles.emptyContentImage}
						/>
					</View>
				}
				data={filteredPlaylist}
				renderItem={({ item: playlist }) => (
					<PlaylistListItem playlist={playlist} onPress={() => handlePlaylistPress(playlist)} onLongPress={() => handlePlaylistLongPress(playlist)} />
				)}
				{...flatListProps}
			/>
		</View>
	)
}