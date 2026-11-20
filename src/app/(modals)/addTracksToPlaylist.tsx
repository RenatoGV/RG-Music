import { ScreenHeader } from '@/components/common/ScreenHeader'
import { GradientButton } from '@/components/common/GradientButton'
import { SelectTrackList } from '@/components/playlist/SelectTrackList'
import { colors, screenPadding } from '@/constants/tokens'
import { filterTrackByTitle } from '@/helpers/filter'
import { showToast } from '@/helpers/toast'
import { useTracks } from '@/store/library'
import { usePlaylistStore } from '@/store/playlist'
import { defaultStyles } from '@/styles'
import { FontAwesome6 } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Redirect, router, Stack, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const AddTracksToPlaylistModal = () => {
	const { playlistId } = useLocalSearchParams<{ playlistId: string }>()
	const tracks = useTracks()
	const { playlists, addMultipleToPlaylist } = usePlaylistStore()
	const insets = useSafeAreaInsets()
	const [search, setSearch] = useState('')
	const [selectedTracks, setSelectedTracks] = useState<string[]>([])

	const currentPlaylist = playlists?.find((playlist) => playlist.id === playlistId)
	const availableTracks = useMemo(
		() => (tracks ?? [])
			.filter((track) => !currentPlaylist?.tracksUri.includes(track.url))
			.sort((a, b) => a.title.localeCompare(b.title)),
		[tracks, currentPlaylist?.tracksUri]
	)
	const filteredTracks = useMemo(() => filterTrackByTitle(availableTracks, search), [availableTracks, search])

	if (playlists === null) return null
	if (!currentPlaylist) return <Redirect href="/(tabs)/playlists" />

	const handleToggleTrack = (trackUrl: string) => {
		setSelectedTracks((selected) => selected.includes(trackUrl)
			? selected.filter((url) => url !== trackUrl)
			: [...selected, trackUrl])
	}

	const handleAddTracks = () => {
		if (selectedTracks.length === 0) return

		addMultipleToPlaylist(selectedTracks, currentPlaylist.id)
		showToast(`${selectedTracks.length} canciones agregadas`)
		router.dismiss()
	}

	return (
		<View style={defaultStyles.container}>
			<Stack.Screen options={{ headerShown: false }} />
			<ScreenGradient />
			<ScreenHeader
				title="Playlist"
				subtitle={`Agrega canciones a ${currentPlaylist.name}`}
				onBackPress={() => router.dismiss()}
				backAccessibilityLabel="Volver a la playlist"
				searchValue={search}
				onSearchChange={setSearch}
				searchPlaceholder="Buscar canciones"
				topInset={insets.top}
			/>

			<View style={styles.selectionBar}>
				<Text style={styles.selectionLabel}>
					{selectedTracks.length} {selectedTracks.length === 1 ? 'seleccionada' : 'seleccionadas'}
				</Text>
				<GradientButton
					accessibilityLabel={`Agregar ${selectedTracks.length} canciones a ${currentPlaylist.name}`}
					disabled={selectedTracks.length === 0}
					style={[styles.addButton, selectedTracks.length === 0 && styles.addButtonDisabled]}
					onPress={handleAddTracks}
				>
					<View style={styles.addButtonContent}>
						<FontAwesome6 name="plus" size={15} color={colors.text} />
						<Text style={styles.addButtonText}>Agregar</Text>
					</View>
				</GradientButton>
			</View>

			<SelectTrackList
				tracks={filteredTracks}
				selectedTracks={selectedTracks}
				onTrackSelect={handleToggleTrack}
				style={styles.trackList}
				contentContainerStyle={styles.trackListContent}
			/>
		</View>
	)
}

const ScreenGradient = () => (
	<LinearGradient
		pointerEvents="none"
		colors={['#18553A', '#02181C', '#0E0E10']}
		locations={[0, 0.21, 1]}
		start={{ x: 0.5, y: 0 }}
		end={{ x: 0.5, y: 1 }}
		style={StyleSheet.absoluteFill}
	/>
)

const styles = StyleSheet.create({
	selectionBar: {
		paddingHorizontal: screenPadding.horizontal,
		paddingBottom: 12,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
	},
	selectionLabel: {
		color: colors.primary,
		fontSize: 15,
		fontWeight: '500',
	},
	addButton: {
		minWidth: 132,
		height: 44,
		paddingHorizontal: 18,
		borderRadius: 24,
		alignItems: 'center',
		justifyContent: 'center',
	},
	addButtonDisabled: {
		opacity: 0.45,
	},
	addButtonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 9,
	},
	addButtonText: {
		color: colors.text,
		fontSize: 15,
		fontWeight: '600',
	},
	trackList: {
		flex: 1,
	},
	trackListContent: {
		flexGrow: 1,
		paddingHorizontal: screenPadding.horizontal,
		paddingTop: 8,
		paddingBottom: 28,
	},
})

export default AddTracksToPlaylistModal
