import { Playlist } from '@/helpers/types'
import { EmptyState } from '@/components/common/EmptyState'
import { useState } from 'react'
import { FlatList, FlatListProps, StyleSheet, View } from 'react-native'
import { PlaylistListItem } from './PlaylistListItem'
import { DeletePlaylist } from '@/components/modals/DeletePlaylist'
import { useTabContentBottomPadding } from '@/hooks/useTabContentBottomPadding'
import { screenPadding } from '@/constants/tokens'

type PlaylistsListProps = {
	playlists: Playlist[]
	onPlaylistPress: (playlist: Playlist) => void
	emptyStateTitle?: string
	emptyStateDescription?: string
} & Partial<FlatListProps<Playlist>>

const ItemDivider = () => {
	return <View style={{marginLeft: 80, marginVertical: 10}} />
}

export const PlaylistList = ({playlists, onPlaylistPress: handlePlaylistPress, emptyStateTitle = 'Aún no tienes playlists', emptyStateDescription = 'Crea una playlist para organizar las canciones que te gustan.', ...flatListProps} : PlaylistsListProps) => {
	const contentBottomPadding = useTabContentBottomPadding()
	const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)

	const handlePlaylistLongPress = (playlist : Playlist) => {
		setSelectedPlaylist(playlist)
	}

	return (
		<View style={{ flex: 1 }}>
			<DeletePlaylist selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist} />
			<FlatList
				contentContainerStyle={{ paddingTop: 10, paddingHorizontal: screenPadding.horizontal, paddingBottom: contentBottomPadding, flexGrow: 1 }}
				ItemSeparatorComponent={ItemDivider}
				ListEmptyComponent={
					<EmptyState
						title={emptyStateTitle}
						description={emptyStateDescription}
						style={styles.emptyContent}
					/>
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

const styles = StyleSheet.create({
	emptyContent: {
		flex: 1,
		alignItems: 'center'
	}
})
