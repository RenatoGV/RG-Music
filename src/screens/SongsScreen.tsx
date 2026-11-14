import { colors, fontSize, screenPadding } from '@/constants/tokens'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { defaultStyles, utilsStyles } from '@/styles'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useLayoutEffect, useMemo, useState } from 'react'
import { filterTrackByTitle } from '@/helpers/filter'
import { useLibraryStore, useTracks } from '@/store/library'
import { generateTrackListId } from '@/helpers/miscellaneous'
import { FontAwesome, Ionicons } from '@expo/vector-icons'
import FastImage from 'react-native-fast-image'
import { unknownTrackImageUri } from '@/constants/images'
import { TracksList } from '@/components/track/TracksList'
import { Circle } from 'react-native-progress'
import { SongsFolderModal } from '@/components/modals/SongsFolderModal'
import { refreshMusicFolder, selectMusicFolder } from '@/services/musicFolderService'
import { useNavigation } from 'expo-router'

const SongsScreen = () => {
   const navigation = useNavigation()

   const [modalFolderVisible, setModalFolderVisible] = useState(false)
	const { isLoading, progressLoading } = useLibraryStore()

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

	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Buscar en Canciones',
			shouldShowHintSearchIcon: false,
		},
	})

	const tracks = useTracks()

   const hasLibrary = tracks !== null

   useLayoutEffect(() => {
      navigation.setOptions({
         headerLeft: () => hasLibrary ?
               <TouchableOpacity
                  accessibilityLabel="Opciones de carpeta"
                  onPress={() => setModalFolderVisible(true)}
               >
                  <FontAwesome name="folder-o" size={22} color={colors.primary} />
               </TouchableOpacity>
            :
               null
      })
   }, [navigation, hasLibrary])

	const sortedTracks = useMemo(() => {
      return [...(tracks ?? [])].sort((a, b) => a.title.localeCompare(b.title))
   }, [tracks])

   const filteredTracks = filterTrackByTitle(sortedTracks, search)

	if (isLoading)
		return (
			<View
				style={{
					flex: 1,
					backgroundColor: colors.background,
					paddingHorizontal: screenPadding.horizontal,
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<Circle progress={progressLoading} size={150} showsText color={colors.primary} />
			</View>
		)

	if (!tracks)
		return (
			<View style={{ ...defaultStyles.container, paddingHorizontal: screenPadding.horizontal }}>
				<Text style={utilsStyles.emptyContentText}>No se encontraron canciones</Text>
				<Text
					style={{
						color: colors.textMuted,
						fontSize: fontSize.sm,
						textAlign: 'center',
						marginBottom: 10,
					}}
				>
					Seleccione la carpeta donde se encuentren las canciones (.mp3 o .wav)
				</Text>
				<FastImage
					source={{ uri: unknownTrackImageUri }}
					style={utilsStyles.emptyContentImage}
				/>
				<TouchableOpacity onPress={handleSelectFolder} activeOpacity={0.8} style={styles.button}>
					<Ionicons name="folder-outline" size={22} color={colors.primary} />
					<Text style={styles.buttonText}>Seleccionar carpeta</Text>
				</TouchableOpacity>
			</View>
		)

	return (
		<View style={{ ...defaultStyles.container, paddingHorizontal: screenPadding.horizontal }}>
			<TracksList
				id={generateTrackListId('songs', search)}
				tracks={sortedTracks}
				filteredTracks={filteredTracks}
			/>

         <SongsFolderModal
            visible={modalFolderVisible}
            onClose={closeModal}
            onRefresh={handleRefreshSongs}
            onSelectFolder={handleSelectFolder}
         />
		</View>
	)
}

const styles = StyleSheet.create({
	button: {
		padding: 12,
		backgroundColor: 'rgba(47,47,47,0.5)',
		borderRadius: 8,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		columnGap: 8,
	},
	buttonText: {
		...defaultStyles.text,
		color: colors.primary,
		fontWeight: '600',
		fontSize: 18,
		textAlign: 'center',
	}
})

export default SongsScreen
