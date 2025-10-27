import { PlaylistList } from '@/components/playlist/PlaylistList'
import { colors, fontSize, screenPadding } from '@/constants/tokens'
import { playlistsNameFilter } from '@/helpers/filter'
import { Playlist } from '@/helpers/types'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { useModalStore } from '@/store/modal'
import { defaultStyles } from '@/styles'
import { useRouter } from 'expo-router'
import { useMemo, useState } from 'react'
import {
	Modal,
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
} from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import { usePlaylistStore } from '@/store/playlist'
import { showToast } from '@/helpers/toast'

const PlaylistsScreen = () => {
	const router = useRouter()

	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Buscar en Playlist',
      	shouldShowHintSearchIcon: false
		},
	})

	const { modalVisible, setModalVisible } = useModalStore()
	const [playlistName, setPlaylistName] = useState('')
	const { playlists, addPlaylist } = usePlaylistStore()

	const filteredPlaylists = useMemo(() => {
		if (!playlists) return []

		playlists.sort((a, b) => a.name.localeCompare(b.name))

		return playlists.filter(playlistsNameFilter(search))
	}, [playlists, search])

	const handleSave = () => {
		if (playlistName.trim().length === 0) return
		addPlaylist(playlistName.trim())
		showToast(`Playlist ${playlistName.trim()} creado`)
		closeModal()
	}

	const closeModal = () => {
		setModalVisible(false)
		setPlaylistName('')
	}

	const isDisabled = playlistName.trim().length === 0

	const handlePlaylistPress = (playlist: Playlist) => {
		router.push(`/(tabs)/playlists/${playlist.name}`)
	}

	const handleChangeText = (value: string) => {
		setPlaylistName(value)
	}

	return (
		<View style={defaultStyles.container}>
			<ScrollView
				contentInsetAdjustmentBehavior="automatic"
				style={{ paddingHorizontal: screenPadding.horizontal }}
			>
				<Modal
					animationType="slide"
					transparent={true}
					visible={modalVisible}
					onRequestClose={() => {
						setModalVisible(!modalVisible)
					}}
				>
					<View style={styles.centeredView}>
						<View style={styles.modalView}>
							<TouchableOpacity onPress={closeModal} style={styles.buttonClose}>
								<FontAwesome6 name="circle-xmark" size={22} color={colors.primary} />
							</TouchableOpacity>
							<Text style={styles.modalText}>Crear Playlist</Text>
							<TextInput
								style={styles.modalInput}
								placeholder="Ingrese un nuevo nombre"
								selectionColor={colors.primary}
								placeholderTextColor={colors.textMuted}
								onChangeText={handleChangeText}
							/>
							<TouchableOpacity
								disabled={isDisabled}
								style={[styles.button, styles.buttonSave, { opacity: isDisabled ? 0.5 : 1 }]}
								onPress={handleSave}
							>
								<Text style={styles.textStyle}>Agregar</Text>
							</TouchableOpacity>
						</View>
					</View>
				</Modal>
				<PlaylistList
					scrollEnabled={false}
					playlists={filteredPlaylists}
					onPlaylistPress={handlePlaylistPress}
				/>
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	modalView: {
		width: '90%',
		backgroundColor: '#1c1c1c',
		borderRadius: 20,
		paddingVertical: 20,
		paddingHorizontal: 20,
		alignItems: 'center',
		shadowColor: '#000',
		shadowOffset: {
			width: 0,
			height: 2,
		},
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	button: {
		borderRadius: 20,
		padding: 10,
		elevation: 2,
		paddingHorizontal: 20,
	},
	buttonClose: {
		position: 'absolute',
		right: 12,
		top: 12,
	},
	buttonSave: {
		backgroundColor: colors.primary,
	},
	textStyle: {
		color: 'white',
		fontWeight: 'bold',
		textAlign: 'center',
	},
	modalText: {
		marginBottom: 15,
		textAlign: 'center',
		color: colors.primary,
		fontWeight: '500',
		fontSize: fontSize.sm,
	},
	modalInput: {
		width: '80%',
		marginBottom: 15,
		backgroundColor: colors.secondary,
		fontSize: fontSize.sm,
		borderRadius: 5,
		paddingHorizontal: 10,
		paddingVertical: 5,
		color: colors.text,
	},
})

export default PlaylistsScreen
