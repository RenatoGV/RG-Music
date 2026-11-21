import { Playlist } from '@/helpers/types'
import { utilsStyles } from '@/styles'
import { useState } from 'react'
import { FlatList, FlatListProps, StyleSheet, Text, View } from 'react-native'
import { PlaylistListItem } from './PlaylistListItem'
import { DeletePlaylist } from '@/components/modals/DeletePlaylist'
import { useTabContentBottomPadding } from '@/hooks/useTabContentBottomPadding'
import LottieView from 'lottie-react-native'
import notFound from '@/assets/lottie/not-found.json'
import { screenPadding } from '@/constants/tokens'

type PlaylistsListProps = {
	playlists: Playlist[]
	onPlaylistPress: (playlist: Playlist) => void
} & Partial<FlatListProps<Playlist>>

const ItemDivider = () => {
	return <View style={{marginLeft: 80, marginVertical: 10}} />
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
				contentContainerStyle={{ paddingTop: 10, paddingHorizontal: screenPadding.horizontal, paddingBottom: contentBottomPadding, flexGrow: 1 }}
				ItemSeparatorComponent={ItemDivider}
				ListEmptyComponent={
					<View style={styles.emptyContent}>
						<Text style={utilsStyles.emptyContentText}>Sin Playlists</Text>
            		<LottieView source={notFound} style={{width: '100%', height: '25%'}} autoPlay loop={true} />
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

const styles = StyleSheet.create({
	emptyContent: {
		flex: 1,
		alignItems: 'center'
	}
})
