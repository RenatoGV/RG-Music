import { ScreenHeader } from '@/components/common/ScreenHeader'
import { ArtistArtwork } from '@/components/artist/ArtistArtwork'
import { colors, screenPadding } from '@/constants/tokens'
import { filterArtistsByName } from '@/helpers/filter'
import type { Track } from '@/helpers/types'
import { useTabContentBottomPadding } from '@/hooks/useTabContentBottomPadding'
import { useArtists } from '@/store/library'
import { defaultStyles, utilsStyles } from '@/styles'
import { LinearGradient } from 'expo-linear-gradient'
import { Link } from 'expo-router'
import LottieView from 'lottie-react-native'
import { useMemo, useState } from 'react'
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import notFound from '@/assets/lottie/not-found.json'
import { MaterialIcons } from '@expo/vector-icons'

const ItemSeparatorComponent = () => {
	return <View style={{ marginVertical: 5, marginLeft: 70 }} />
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
				contentContainerStyle={{ paddingHorizontal: screenPadding.horizontal, paddingBottom: contentBottomPadding, flexGrow: 1 }}
				ItemSeparatorComponent={ItemSeparatorComponent}
				ListEmptyComponent={
					<View style={styles.emptyContent}>
						<Text style={utilsStyles.emptyContentText}>Sin resultados</Text>
							<LottieView source={notFound} style={{width: '100%', height: '25%'}} autoPlay loop={true} />
					</View>
				}
				data={filteredArtists}
				showsVerticalScrollIndicator={false}
				renderItem={({ item: artist }) => {
					return (
						<Link href={`/artists/${artist.name}`} asChild>
							<TouchableOpacity activeOpacity={0.8}>
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
									<MaterialIcons name="navigate-next" size={30} color={colors.textMuted} />
								</View>
							</TouchableOpacity>
						</Link>
					)
				}}
			/>
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
	emptyContent: {
		flex: 1,
		paddingHorizontal: screenPadding.horizontal,
		alignItems: 'center'
	},
	artistItemContainer: {
		flexDirection: 'row',
		columnGap: 14,
		alignItems: 'center',
		minHeight: 72,
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
})

export default ArtistsScreen
