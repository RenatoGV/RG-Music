import { FlatList, StyleSheet, Text, View } from 'react-native'
import type { FlatListProps } from 'react-native'
import type { Track } from '@/helpers/types'
import { SelectTrackListItem } from './SelectTrackListItem'
import { utilsStyles } from '@/styles'
import LottieView from 'lottie-react-native'
import notFound from '@/assets/lottie/not-found.json'
import { screenPadding } from '@/constants/tokens'

export type Props = Partial<FlatListProps<Track>> & {
	tracks: Track[]
	selectedTracks: string[]
	onTrackSelect: (trackUrl: string) => void
}

const ItemDivider = () => <View style={{ ...utilsStyles.itemSeparator, marginVertical: 9, marginLeft: 60 }} />

export const SelectTrackList = ({ tracks, selectedTracks, onTrackSelect, ...flatlistProps }: Props) => (
	<FlatList
		data={tracks}
		ItemSeparatorComponent={ItemDivider}
		initialNumToRender={15}
		maxToRenderPerBatch={15}
		windowSize={5}
		removeClippedSubviews
		ListEmptyComponent={
			<View style={styles.emptyContent}>
				<Text style={utilsStyles.emptyContentText}>Sin resultados</Text>
					<LottieView source={notFound} style={{width: '100%', height: '25%'}} autoPlay loop={true} />
			</View>
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
