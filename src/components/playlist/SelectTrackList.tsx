import { FlatList, StyleSheet, View } from 'react-native'
import type { FlatListProps } from 'react-native'
import type { Track } from '@/helpers/types'
import { SelectTrackListItem } from './SelectTrackListItem'
import { EmptyState } from '@/components/common/EmptyState'
import { screenPadding } from '@/constants/tokens'

export type Props = Partial<FlatListProps<Track>> & {
	tracks: Track[]
	selectedTracks: string[]
	onTrackSelect: (trackUrl: string) => void
	emptyStateTitle?: string
	emptyStateDescription?: string
}

const ItemDivider = () => <View style={{ marginVertical: 10, marginLeft: 60 }} />

export const SelectTrackList = ({ tracks, selectedTracks, onTrackSelect, emptyStateTitle = 'No hay canciones para agregar', emptyStateDescription = 'Importa canciones a tu biblioteca y luego podrás añadirlas a esta playlist.', ...flatlistProps }: Props) => (
	<FlatList
		data={tracks}
		ItemSeparatorComponent={ItemDivider}
		initialNumToRender={15}
		maxToRenderPerBatch={15}
		windowSize={5}
		removeClippedSubviews
		ListEmptyComponent={
			<EmptyState
				title={emptyStateTitle}
				description={emptyStateDescription}
				style={styles.emptyContent}
			/>
		}
		ListFooterComponent={<View style={{ height: 20 }} />}
		renderItem={({ item: track }) => (
			<SelectTrackListItem track={track} onTrackSelect={onTrackSelect} selectedTracks={selectedTracks} />
		)}
		showsVerticalScrollIndicator={false}
		{...flatlistProps}
	/>
)

const styles = StyleSheet.create({
	emptyContent: {
		flex: 1,
		paddingTop: 20,
		paddingHorizontal: screenPadding.horizontal,
		alignItems: 'center'
	}
})
