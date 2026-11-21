import { ScreenHeader } from '@/components/common/ScreenHeader'
import { ArtistArtwork } from '@/components/artist/ArtistArtwork'
import { TracksList } from '@/components/track/TracksList'
import { colors, screenPadding } from '@/constants/tokens'
import { filterTrackByTitle } from '@/helpers/filter'
import { useArtists } from '@/store/library'
import { defaultStyles } from '@/styles'
import { LinearGradient } from 'expo-linear-gradient'
import { Redirect, router, useLocalSearchParams } from 'expo-router'
import { useMemo, useState } from 'react'
import { Keyboard, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import type { NativeScrollEvent, NativeSyntheticEvent } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated'

const ArtistDetailScreen = () => {
	const { name: artistName } = useLocalSearchParams<{ name: string }>()
	const artists = useArtists()
	const insets = useSafeAreaInsets()
	const { width: screenWidth } = useWindowDimensions()
	const [search, setSearch] = useState('')
	const [searchOpen, setSearchOpen] = useState(false)
	const screenHeight = useSharedValue(0)
	const headerHeight = useSharedValue(0)
	const listHeaderHeight = useSharedValue(0)
	const listScrollY = useSharedValue(0)
	const listScrollHandler = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
		listScrollY.value = event.nativeEvent.contentOffset.y
	}
	const stickyGradientStyle = useAnimatedStyle(() => {
		const listContentOffset = listHeaderHeight.value + 10
		const scrollIntoHeader = Math.min(listScrollY.value, listContentOffset)
		const controlsScreenY = headerHeight.value + listContentOffset - scrollIntoHeader

		return {
			top: -controlsScreenY,
			height: screenHeight.value,
		}
	})

	const artist = artists?.find((item) => item.name.toLowerCase() === artistName?.toLowerCase())

	const sortedTracks = useMemo(() => {
		if (!artist) return []
		return [...artist.tracks].sort((a, b) => a.title.localeCompare(b.title))
	}, [artist])
	const filteredTracks = useMemo(() => filterTrackByTitle(sortedTracks, search), [sortedTracks, search])
	const queueId = `artist:${artist?.name ?? artistName ?? ''}`
	const isSearching = searchOpen

	if (!artist) {
		console.warn(`Artist ${artistName} not found!`)
		return <Redirect href={'/(tabs)/artists'} />
	}

	const hasAllDurations = artist.tracks.length > 0 && artist.tracks.every(
		(track) => typeof track.duration === 'number' && track.duration > 0,
	)
	const totalDuration = hasAllDurations
		? artist.tracks.reduce((total, track) => total + (track.duration ?? 0), 0)
		: null
	const totalMinutes = totalDuration === null ? null : Math.round(totalDuration / 60)
	const durationValue = totalMinutes === null ? null : `${totalMinutes}`
	const artworkSize = Math.min(220, Math.max(160, screenWidth * 0.54))

	return (
		<View style={defaultStyles.container} onLayout={({ nativeEvent }) => { screenHeight.value = nativeEvent.layout.height }}>
			<ScreenGradient />
			<View onLayout={({ nativeEvent }) => { headerHeight.value = nativeEvent.layout.height }}>
				<ScreenHeader
					onBackPress={() => router.back()}
					backAccessibilityLabel="Volver a artistas"
					onSearchChange={setSearch}
					searchValue={search}
					searchExpanded={searchOpen}
					onSearchOpenChange={setSearchOpen}
					searchPlaceholder={`Buscar en ${artist.name}`}
					topInset={insets.top}
				/>
			</View>

			<TracksList
				id={queueId}
				tracks={sortedTracks}
				filteredTracks={filteredTracks}
				hideQueueControls
				stickyQueueControls
				stickyQueueControlsBackground={(
					<Animated.View pointerEvents="none" style={[styles.stickyGradientClone, stickyGradientStyle]}>
						<LinearGradient
							colors={['#18553A', '#02181C', '#0E0E10']}
							locations={[0, 0.36, 1]}
							start={{ x: 0.5, y: 0 }}
							end={{ x: 0.5, y: 1 }}
							style={StyleSheet.absoluteFill}
						/>
					</Animated.View>
				)}
				onScroll={listScrollHandler}
				bounces={false}
				alwaysBounceVertical={false}
				overScrollMode="never"
				onTrackPress={() => {
					setSearch('')
					setSearchOpen(false)
					Keyboard.dismiss()
				}}
				ListHeaderComponent={(
					<View onLayout={({ nativeEvent }) => { listHeaderHeight.value = nativeEvent.layout.height }}>
						<View style={styles.profileSection}>
							{!isSearching && (
								<ArtistArtwork tracks={artist.tracks} size={artworkSize} borderRadius={artworkSize / 2} />
							)}
							<Text numberOfLines={1} style={styles.artistName}>{artist.name}</Text>

							{!isSearching && (
								<View style={styles.statsRow}>
									<Stat value={`${artist.tracks.length}`} label="Canciones" />
									{durationValue !== null && (
										<Stat value={durationValue} label="Minutos" />
									)}
								</View>
							)}
						</View>
						<View style={styles.listHeading}>
							<Text style={styles.songsHeading}>Canciones</Text>
						</View>
					</View>
				)}
				style={styles.trackList}
			/>
		</View>
	)
}

const Stat = ({ value, label }: { value: string; label: string }) => (
	<View style={styles.stat}>
		<Text style={styles.statValue}>{value}</Text>
		<Text style={styles.statLabel}>{label}</Text>
	</View>
)

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
		alignItems: 'center',
		paddingHorizontal: screenPadding.horizontal,
		paddingTop: 2,
	},
	artistName: {
		...defaultStyles.text,
		fontSize: 25,
		fontWeight: '600',
		marginTop: 16,
		maxWidth: '90%',
	},
	statsRow: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		marginTop: 20,
	},
	stat: {
		minWidth: 110,
		alignItems: 'center',
	},
	statValue: {
		...defaultStyles.text,
		fontSize: 22,
		fontWeight: '500',
	},
	statLabel: {
		...defaultStyles.text,
		color: colors.textMuted,
		fontSize: 16,
		marginTop: 3,
	},
	listHeading: {
		paddingHorizontal: screenPadding.horizontal,
		marginTop: 24,
	},
	songsHeading: {
		...defaultStyles.text,
		fontSize: 20,
		fontWeight: '600',
	},
	sortButtonWrap: {
		alignItems: 'flex-end',
	},
	trackList: {
		flex: 1,
	},
	stickyGradientClone: {
		position: 'absolute',
		left: -screenPadding.horizontal,
		right: -screenPadding.horizontal,
	},
})

export default ArtistDetailScreen
