import { unknownPlaylistImageUri } from '@/constants/images'
import { Playlist } from '@/helpers/types'
import { utilsStyles } from '@/styles'
import { useState } from 'react'
import { FlatList, FlatListProps, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { PlaylistListItem } from './PlaylistListItem'
import { DeletePlaylist } from '@/components/modals/DeletePlaylist'
import { useTabContentBottomPadding } from '@/hooks/useTabContentBottomPadding'

type PlaylistsListProps = {
	playlists: Playlist[]
	onPlaylistPress: (playlist: Playlist) => void
} & Partial<FlatListProps<Playlist>>

const ItemDivider = () => {
	return <View style={{...utilsStyles.itemSeparator, marginLeft: 80, marginVertical: 12}} />
}

export const PlaylistList = ({playlists, onPlaylistPress: handlePlaylistPress, ...flatListProps} : PlaylistsListProps) => {
	const contentBottomPadding = useTabContentBottomPadding()
	const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)

	const handlePlaylistLongPress = (playlist : Playlist) => {
		setSelectedPlaylist(playlist)
	}

	return (
		<View style={{ flex: 1 }}>
			<DeletePlaylist selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist} />
			<FlatList
				contentContainerStyle={{ paddingTop: 10, paddingBottom: contentBottomPadding }}
				ItemSeparatorComponent={ItemDivider}
				ListEmptyComponent={
					<View>
						<Text style={utilsStyles.emptyContentText}>No se encontraron Playlists</Text>

						<FastImage
							source={{ uri: unknownPlaylistImageUri }}
							style={utilsStyles.emptyContentImage}
						/>
					</View>
				}
				data={playlists}
				renderItem={({ item: playlist }) => (
					<PlaylistListItem playlist={playlist} onPress={() => handlePlaylistPress(playlist)} onLongPress={() => handlePlaylistLongPress(playlist)} />
				)}
				{...flatListProps}
			/>
		</View>
	)
}