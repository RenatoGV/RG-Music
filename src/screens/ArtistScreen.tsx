import { ScreenHeader } from '@/components/common/ScreenHeader'
import { unknownArtistImageUri, unknownTrackImageUri } from '@/constants/images'
import { screenPadding } from '@/constants/tokens'
import { filterArtistsByName } from '@/helpers/filter'
import type { Track } from '@/helpers/types'
import { useTabContentBottomPadding } from '@/hooks/useTabContentBottomPadding'
import { useArtists } from '@/store/library'
import { defaultStyles, utilsStyles } from '@/styles'
import { LinearGradient } from 'expo-linear-gradient'
import { Link } from 'expo-router'
import { useMemo, useState } from 'react'
import { FlatList, StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

const ItemSeparatorComponent = () => {
	return <View style={{ marginVertical: 10, marginLeft: 70 }} />
}

const ArtistsScreen = () => {
	const insets = useSafeAreaInsets()
	const [search, setSearch] = useState('')
	const contentBottomPadding = useTabContentBottomPadding()

	const artists = useArtists()

	const sortedArtists = useMemo(
      () => [...(artists ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
      [artists]
   )

   const filteredArtists = filterArtistsByName(sortedArtists, search)

	return (
		<View style={defaultStyles.container}>
			<ScreenGradient />
			<ScreenHeader
				title="Artistas"
				searchValue={search}
				onSearchChange={setSearch}
				searchPlaceholder="Buscar Artista"
				topInset={insets.top}
			/>
			<FlatList
				contentContainerStyle={{ paddingHorizontal: screenPadding.horizontal, paddingBottom: contentBottomPadding }}
				ItemSeparatorComponent={ItemSeparatorComponent}
				ListEmptyComponent={
					<View>
						<Text style={utilsStyles.emptyContentText}>No se encontraron artistas</Text>
						<FastImage
							source={{ uri: unknownArtistImageUri }}
							style={utilsStyles.emptyContentImage}
						/>
					</View>
				}
				data={filteredArtists}
				showsVerticalScrollIndicator={false}
				renderItem={({ item: artist }) => {
					return (
						<Link href={`/artists/${artist.name}`} asChild>
							<TouchableHighlight activeOpacity={0.8}>
								<View style={styles.artistItemContainer}>
									<ArtistArtwork tracks={artist.tracks} />
									<View style={styles.artistTextContainer}>
										<Text numberOfLines={1} style={styles.artistNameText}>
											{artist.name}
										</Text>
										<Text numberOfLines={1} style={styles.artistSubtitleText}>
											{getArtistSubtitle(artist.tracks)}
										</Text>
									</View>
								</View>
							</TouchableHighlight>
						</Link>
					)
				}}
			/>
		</View>
	)
}

const ArtistArtwork = ({ tracks }: { tracks: Track[] }) => {
	const artworks = tracks
		.map((track) => track.artwork?.trim())
		.filter((artwork): artwork is string => Boolean(artwork) && artwork !== unknownArtistImageUri && artwork !== unknownTrackImageUri)
		.slice(0, 4)

	if (artworks.length === 0) {
		return <FastImage source={{ uri: unknownArtistImageUri }} style={styles.artistImage} />
	}

	if (artworks.length === 3) {
		return (
			<View style={styles.artistImage}>
				<FastImage source={{ uri: artworks[0] }} style={styles.threeArtworkMain} />
				<View style={styles.threeArtworkSide}>
					<FastImage source={{ uri: artworks[1] }} style={styles.threeArtworkTile} />
					<FastImage source={{ uri: artworks[2] }} style={styles.threeArtworkTile} />
				</View>
			</View>
		)
	}

	return (
		<View style={styles.artistImage}>
			{artworks.map((artwork, index) => (
				<FastImage
					key={`${artwork}-${index}`}
					source={{ uri: artwork }}
					style={artworks.length === 1 ? styles.singleArtworkImage : artworks.length === 2 ? styles.halfArtworkTile : styles.quarterArtworkTile}
				/>
			))}
		</View>
	)
}

const getArtistSubtitle = (tracks: Track[]) => {
	const count = tracks.length
	const countLabel = `${count} ${count === 1 ? 'canción' : 'canciones'}`
	const hasAllDurations = count > 0 && tracks.every((track) => typeof track.duration === 'number' && track.duration > 0)
	if (!hasAllDurations) return countLabel

	const totalMinutes = Math.round(tracks.reduce((total, track) => total + (track.duration ?? 0), 0) / 60)
	const hours = Math.floor(totalMinutes / 60)
	const minutes = totalMinutes % 60
	const durationLabel = hours === 0
		? `${totalMinutes} ${totalMinutes === 1 ? 'minuto' : 'minutos'}`
		: minutes === 0
			? `${hours} ${hours === 1 ? 'hora' : 'horas'}`
			: `${hours} h ${minutes} min`

	return `${countLabel} • ${durationLabel}`
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
	artistItemContainer: {
		flexDirection: 'row',
		columnGap: 14,
		alignItems: 'center',
		minHeight: 72,
	},
	artistImage: {
		borderRadius: 12,
		width: 56,
		height: 56,
		overflow: 'hidden',
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	artistTextContainer: {
		flex: 1,
		justifyContent: 'center',
		minWidth: 0,
	},
	artistNameText: {
		...defaultStyles.text,
		fontSize: 17,
	},
	artistSubtitleText: {
		...defaultStyles.text,
		color: '#9ca3af',
		fontSize: 13,
		marginTop: 3,
	},
	singleArtworkImage: {
		width: '100%',
		height: '100%',
	},
	halfArtworkTile: {
		width: '49.5%',
		height: '100%',
		marginRight: '1%',
	},
	quarterArtworkTile: {
		width: '49.5%',
		height: '49.5%',
		marginRight: '1%',
		marginBottom: '1%',
	},
	threeArtworkMain: {
		width: '49.5%',
		height: '100%',
		marginRight: '1%',
	},
	threeArtworkSide: {
		flex: 1,
		height: '100%',
		justifyContent: 'space-between',
	},
	threeArtworkTile: {
		width: '100%',
		height: '49.5%',
	},
})

export default ArtistsScreen
