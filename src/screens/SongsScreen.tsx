import { colors, fontSize, screenPadding } from '@/constants/tokens'
import { defaultStyles, utilsStyles } from '@/styles'
import { StyleSheet, Text, View } from 'react-native'
import { useEffect, useMemo, useState } from 'react'
import { filterTrackByTitle } from '@/helpers/filter'
import { useLibraryStore, useTracks } from '@/store/library'
import { generateTrackListId } from '@/helpers/miscellaneous'
import { Ionicons } from '@expo/vector-icons'
import { TracksList } from '@/components/track/TracksList'
import { QueueControls } from '@/components/other/QueueControls'
import { Bar } from 'react-native-progress'
import { LinearGradient } from 'expo-linear-gradient'
import { SongsFolderModal } from '@/components/modals/SongsFolderModal'
import { refreshMusicFolder, selectMusicFolder } from '@/services/musicFolderService'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { ScreenHeader } from '@/components/common/ScreenHeader'
import { getAudioDuration } from '@/helpers/audioDuration'
import { saveData } from '@/helpers/storage'
import { GradientButton } from '@/components/common/GradientButton'
import LottieView from 'lottie-react-native'
import musicLoading from '@/assets/lottie/music-loading.json'
import notFound from '@/assets/lottie/not-found.json'

const SongsScreen = () => {
   const [modalFolderVisible, setModalFolderVisible] = useState(false)
	const [search, setSearch] = useState('')
	const insets = useSafeAreaInsets()
	const { isLoading, progressLoading, setTracks } = useLibraryStore()

	const handleSelectFolder = async () => {
		closeModal()
		try {
			await selectMusicFolder()
		} catch (error) {
			console.log('Error al seleccionar la carpeta', error)
		}
	}

	const handleRefreshSongs = async () => {
		closeModal()
		try {
			await refreshMusicFolder()
		} catch (error) {
			console.error('Error al actualizar la carpeta', error)
		}
	}

	const closeModal = () => {
		setModalFolderVisible(false)
	}

	const tracks = useTracks()

	const sortedTracks = useMemo(() => {
      return [...(tracks ?? [])].sort((a, b) => a.title.localeCompare(b.title))
   }, [tracks])
	const filteredTracks = filterTrackByTitle(sortedTracks, search)
	const songsQueueId = generateTrackListId('songs', search)
	const totalDuration = sortedTracks.reduce(
		(total, track) => total + (typeof track.duration === 'number' ? track.duration : 0),
		0,
	)
	const songCountLabel = `${sortedTracks.length} ${sortedTracks.length === 1 ? 'canción' : 'canciones'}`
	const hasAllDurations = sortedTracks.length > 0 && sortedTracks.every((track) => typeof track.duration === 'number')
	const subtitle = hasAllDurations
		? `${songCountLabel} • ${formatLibraryDuration(totalDuration)}`
		: songCountLabel

	useEffect(() => {
		if (!tracks?.some((track) => track.duration === undefined)) return

		let isActive = true
		const tracksWithoutDuration = tracks.filter((track) => track.duration === undefined)
		const loadDurations = async () => {
			const durations = new Map<string, number | null>()
			let nextIndex = 0
			const workerCount = Math.min(4, tracksWithoutDuration.length)

			await Promise.all(Array.from({ length: workerCount }, async () => {
				while (nextIndex < tracksWithoutDuration.length) {
					const track = tracksWithoutDuration[nextIndex++]
					durations.set(track.url, await getAudioDuration(track.url))
				}
			}))

			if (!isActive) return

			const currentTracks = useLibraryStore.getState().tracks ?? []
			const updatedTracks = currentTracks.map((track) => ({
				...track,
				...(track.duration === undefined && durations.has(track.url)
					? { duration: durations.get(track.url) ?? null }
					: {}),
			}))

			setTracks(updatedTracks)
			saveData('tracks', updatedTracks)
		}

		void loadDurations().catch((error) => {
			console.warn('No se pudieron calcular las duraciones de la biblioteca', error)
		})

		return () => {
			isActive = false
		}
	}, [tracks, setTracks])

	const handleFolderButton = () => {
		if (tracks === null) {
			void handleSelectFolder()
			return
		}
		setModalFolderVisible(true)
	}

	return (
		<View style={defaultStyles.container}>
			<ScreenGradient />
			{isLoading ? (
				<View style={styles.loadingContent}>
					<LottieView source={musicLoading} style={{width: '100%', height: '40%'}} autoPlay loop={true} />
					<View style={{width: '100%'}}>
						<Bar progress={progressLoading} width={null} height={15} color={colors.primary} borderWidth={2} borderRadius={10} animationType='timing' />
					</View>
				</View>
			) : tracks === null ? (
				<View style={styles.emptyContent}>
					<Text style={utilsStyles.emptyContentText}>Sin Canciones</Text>
					<Text style={styles.emptyHint}>
						Seleccione una carpeta para importar canciones (.mp3 o .wav)
					</Text>
					<LottieView source={notFound} style={{width: '100%', height: '25%'}} autoPlay loop={true} />

					<GradientButton onPress={handleSelectFolder} style={styles.button}>
						<Ionicons name="folder-outline" size={22} color={colors.text} />
						<Text style={styles.buttonText}>Seleccionar carpeta</Text>
					</GradientButton>
				</View>
			) : (
				<>
					<ScreenHeader
						title="Tu librería"
						subtitle={subtitle}
						onFolderPress={handleFolderButton}
						searchValue={search}
						onSearchChange={setSearch}
						searchPlaceholder="Buscar en Canciones"
						topInset={insets.top}
					/>
					<View style={styles.content}>
						{sortedTracks.length > 0 && (
							<QueueControls
								queueId={songsQueueId}
								tracks={sortedTracks}
								style={styles.queueControls}
							/>
						)}
						<TracksList
							id={songsQueueId}
							tracks={sortedTracks}
							filteredTracks={filteredTracks}
							hideQueueControls
							style={styles.trackList}
						/>
					</View>
				</>
			)}

			<SongsFolderModal visible={modalFolderVisible} onClose={closeModal} onRefresh={handleRefreshSongs} onSelectFolder={handleSelectFolder} />
		</View>
	)
}

const formatLibraryDuration = (durationSeconds: number) => {
	const totalMinutes = Math.round(durationSeconds / 60)
	const hours = Math.floor(totalMinutes / 60)
	const minutes = totalMinutes % 60

	if (hours === 0) return `${totalMinutes} ${totalMinutes === 1 ? 'minuto' : 'minutos'}`
	if (minutes === 0) return `${hours} ${hours === 1 ? 'hora' : 'horas'}`
	return `${hours} h ${minutes} min`
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
	loadingContent: {
		flex: 1,
		paddingHorizontal: screenPadding.horizontal,
		alignItems: 'center',
		justifyContent: 'center'
	},
	emptyContent: {
		flex: 1,
		paddingHorizontal: screenPadding.horizontal,
		alignItems: 'center',
		justifyContent: 'center'
	},
	emptyHint: {
		color: colors.textMuted,
		fontSize: fontSize.sm,
		textAlign: 'center',
		marginBottom: 10,
	},
	content: {
		flex: 1,
		paddingHorizontal: screenPadding.horizontal,
	},
	queueControls: {
		paddingBottom: 20,
	},
	trackList: {
		flex: 1,
	},
	button: {
		paddingVertical: 12,
		paddingHorizontal: 20,
		backgroundColor: 'rgba(47,47,47,0.5)',
		borderRadius: 50,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		columnGap: 8,
	},
	buttonText: {
		...defaultStyles.text,
		color: colors.text,
		fontWeight: '600',
		fontSize: 18,
		textAlign: 'center',
	}
})

export default SongsScreen
