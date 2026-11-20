import { ArtistArtwork } from '@/components/artist/ArtistArtwork'
import { ScreenHeader } from '@/components/common/ScreenHeader'
import { LiquidGlassButton } from '@/components/common/LiquidGlassButton'
import { DeletePlaylist } from '@/components/modals/DeletePlaylist'
import { QueueControls } from '@/components/other/QueueControls'
import { TracksList } from '@/components/track/TracksList'
import { unknownPlaylistImageUri } from '@/constants/images'
import { colors, screenPadding } from '@/constants/tokens'
import { filterTrackByTitle } from '@/helpers/filter'
import type { Playlist } from '@/helpers/types'
import { useTracks } from '@/store/library'
import { usePlaylistStore } from '@/store/playlist'
import { defaultStyles } from '@/styles'
import { Ionicons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { Keyboard, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const PlaylistScreen = () => {
	const { id } = useLocalSearchParams<{ id: string }>()
	const { playlists } = usePlaylistStore()
	const tracks = useTracks()
	const insets = useSafeAreaInsets()
	const { width: screenWidth } = useWindowDimensions()
	const [search, setSearch] = useState('')
	const [searchOpen, setSearchOpen] = useState(false)
	const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null)

	const playlist = playlists?.find((item) => item.id === id)
	const playlistTracks = useMemo(
		() => (tracks ?? [])
			.filter((track) => playlist?.tracksUri.includes(track.url))
			.sort((a, b) => a.title.localeCompare(b.title)),
		[tracks, playlist?.tracksUri]
	)
	const filteredTracks = useMemo(() => filterTrackByTitle(playlistTracks, search), [playlistTracks, search])
	const queueId = `playlist:${playlist?.id ?? id}`
	const artworkSize = Math.min(230, Math.max(170, screenWidth * 0.58))
	const hasAllDurations = playlistTracks.length > 0 && playlistTracks.every(
		(track) => typeof track.duration === 'number' && track.duration > 0,
	)
	const totalDuration = hasAllDurations
		? playlistTracks.reduce((total, track) => total + (track.duration ?? 0), 0)
		: null
	const totalMinutes = totalDuration === null ? null : Math.round(totalDuration / 60)
	const summary = totalMinutes === null
		? `${playlistTracks.length} ${playlistTracks.length === 1 ? 'canción' : 'canciones'}`
		: `${playlistTracks.length} ${playlistTracks.length === 1 ? 'canción' : 'canciones'} • ${formatDuration(totalMinutes)}`

	if (!playlist) {
		console.warn(`Playlist ${id} was not found!`)
		return <Redirect href={'/(tabs)/playlists'} />
	}

	const handleAddTracks = () => {
		router.push({
			pathname: '/(modals)/addTracksToPlaylist',
			params: { playlistId: playlist.id },
		})
	}

	return (
		<View style={defaultStyles.container}>
			<ScreenGradient />
			<ScreenHeader
				onBackPress={() => router.back()}
				backAccessibilityLabel="Volver a playlists"
				onSearchChange={setSearch}
				searchValue={search}
				searchExpanded={searchOpen}
				onSearchOpenChange={setSearchOpen}
				searchPlaceholder={`Buscar en ${playlist.name}`}
				onOtherActionPress={() => setSelectedPlaylist(playlist)}
				onOtherActionIcon={<Ionicons name="ellipsis-vertical" size={18} color={colors.text} />}
				otherActionAccessibilityLabel="Eliminar playlist"
				topInset={insets.top}
			/>

			<View style={styles.profileSection}>
				{!searchOpen && (
					<View style={styles.artworkContainer}>
						<ArtistArtwork
							tracks={playlistTracks}
							size={artworkSize}
							borderRadius={24}
							fallbackArtworkUri={unknownPlaylistImageUri}
						/>
					</View>
				)}

				<View style={styles.titleRow}>
					<Text numberOfLines={1} style={styles.playlistName}>{playlist.name}</Text>
					<View style={styles.actions}>
						<LiquidGlassButton
							accessibilityLabel="Añadir canciones"
							onPress={handleAddTracks}
							style={styles.actionButton}
						>
							<Ionicons name="add" size={22} color={colors.text} />
						</LiquidGlassButton>
						<QueueControls queueId={queueId} tracks={playlistTracks} compact />
					</View>
				</View>

				{!searchOpen && <Text style={styles.summary}>{summary}</Text>}
			</View>

			<TracksList
				id={queueId}
				tracks={playlistTracks}
				filteredTracks={filteredTracks}
				fromPlaylist={playlist}
				hideQueueControls
				onTrackPress={() => {
					setSearch('')
					setSearchOpen(false)
					Keyboard.dismiss()
				}}
				style={styles.trackList}
			/>

			<DeletePlaylist selectedPlaylist={selectedPlaylist} setSelectedPlaylist={setSelectedPlaylist} />
		</View>
	)
}

const formatDuration = (totalMinutes: number) => {
	const hours = Math.floor(totalMinutes / 60)
	const minutes = totalMinutes % 60
	if (hours === 0) return `${totalMinutes} min`
	if (minutes === 0) return `${hours} h`
	return `${hours} h ${minutes} min`
}

const ScreenGradient = () => (
	<LinearGradient
		pointerEvents="none"
		colors={['#18553A', '#02181C', '#0E0E10']}
		locations={[0, 0.36, 1]}
		start={{ x: 0.5, y: 0 }}
		end={{ x: 0.5, y: 1 }}
		style={StyleSheet.absoluteFill}
	/>
)

const styles = StyleSheet.create({
	profileSection: {
		paddingHorizontal: screenPadding.horizontal,
		paddingTop: 4,
	},
	artworkContainer: {
		width: '100%',
		alignItems: 'center',
	},
	titleRow: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		columnGap: 8,
		marginTop: 20,
	},
	playlistName: {
		...defaultStyles.text,
		flex: 1,
		fontSize: 23,
		fontWeight: '700',
	},
	actions: {
		flexDirection: 'row',
		alignItems: 'center',
		columnGap: 8,
	},
	actionButton: {
		width: 42,
		height: 42,
		borderRadius: 21,
		alignItems: 'center',
		justifyContent: 'center',
		padding: 0,
	},
	summary: {
		...defaultStyles.text,
		color: colors.textMuted,
		fontSize: 15,
		marginTop: 8,
	},
	trackList: {
		flex: 1,
		paddingHorizontal: screenPadding.horizontal,
		marginTop: 22,
	},
})

export default PlaylistScreen
