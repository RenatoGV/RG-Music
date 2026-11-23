import { useContext } from 'react'
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import { colors, fontSize } from '@/constants/tokens'
import { showToast } from '@/helpers/toast'
import type { Playlist } from '@/helpers/types'
import { usePlaylistStore } from '@/store/playlist'
import { LiquidGlassSurface } from '@/components/glass/LiquidGlassSurface'
import { LiquidGlassBlurTargetRefContext } from '@/components/glass/LiquidGlassBlurTarget'
import { LiquidGlassButton } from '@/components/common/LiquidGlassButton'

type Props = {
	selectedPlaylist: Playlist | null
	setSelectedPlaylist: React.Dispatch<React.SetStateAction<Playlist | null>>
}

export const DeletePlaylist = ({ selectedPlaylist, setSelectedPlaylist }: Props) => {
	const { removePlaylist } = usePlaylistStore()
	const blurTarget = useContext(LiquidGlassBlurTargetRefContext)
	const visible = selectedPlaylist !== null

	const handleClose = () => setSelectedPlaylist(null)
	const handleDelete = () => {
		if (!selectedPlaylist) return

		const playlistName = selectedPlaylist.name
		removePlaylist(selectedPlaylist.id)
		showToast(`Playlist ${playlistName} eliminado`)
		setSelectedPlaylist(null)
	}

	return (
		<Modal
			animationType="fade"
			transparent
			visible={visible}
			statusBarTranslucent
			onRequestClose={handleClose}
		>
			<View style={styles.overlay}>
				<Pressable accessibilityLabel="Cerrar" style={styles.backdrop} onPress={handleClose} />
				<View pointerEvents="box-none" style={styles.centeredView}>
					<LiquidGlassSurface
						intensity={15}
						borderRadius={20}
						blurTarget={blurTarget ?? undefined}
						style={styles.modalSurface}
					>
						<TouchableOpacity
							accessibilityRole="button"
							accessibilityLabel="Cerrar"
							hitSlop={10}
							onPress={handleClose}
							style={styles.buttonClose}
						>
							<FontAwesome6 name="xmark" size={14} color={colors.text} />
						</TouchableOpacity>

						<View style={styles.heading}>
							<Text style={styles.title}>Eliminar playlist</Text>
							<Text style={styles.description}>
								¿Quieres eliminar “{selectedPlaylist?.name}”? Esta acción no se puede deshacer.
							</Text>
						</View>

						<View style={styles.actions}>
							<LiquidGlassButton style={styles.modalButton} onPress={handleClose}>
								<View style={styles.buttonContent}>
									<FontAwesome6 name="xmark" size={16} color={colors.text} />
									<Text style={styles.buttonText}>Cancelar</Text>
								</View>
							</LiquidGlassButton>

							<LiquidGlassButton borderTintColor="#ff8585" style={styles.deleteButton} onPress={handleDelete}>
								<View style={styles.buttonContent}>
									<FontAwesome6 name="trash-can" size={16} color="#ff8585" />
									<Text style={styles.deleteButtonText}>Eliminar playlist</Text>
								</View>
							</LiquidGlassButton>
						</View>
					</LiquidGlassSurface>
				</View>
			</View>
		</Modal>
	)
}

const styles = StyleSheet.create({
	overlay: {
		flex: 1,
	},
	centeredView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 24,
	},
	backdrop: {
		...StyleSheet.absoluteFill,
		backgroundColor: 'rgba(0, 8, 10, 0.28)',
	},
	modalSurface: {
		width: '100%',
		maxWidth: 380,
		paddingTop: 28,
		paddingBottom: 22,
		paddingHorizontal: 22,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 2 },
		shadowOpacity: 0.25,
		shadowRadius: 4,
		elevation: 5,
	},
	heading: {
		gap: 7,
		marginBottom: 20,
		paddingRight: 28,
	},
	title: {
		color: colors.text,
		fontSize: fontSize.base,
		lineHeight: 25,
		fontWeight: '700',
	},
	description: {
		color: 'rgba(255,255,255,0.72)',
		fontSize: fontSize.xs,
		lineHeight: 20,
	},
	actions: {
		gap: 11,
	},
	modalButton: {
		width: '100%',
		height: 52,
		borderRadius: 26,
		justifyContent: 'center',
		elevation: 2,
	},
	deleteButton: {
		width: '100%',
		height: 52,
		borderRadius: 26,
		justifyContent: 'center',
		backgroundColor: 'rgba(180,48,56,0.24)',
		borderColor: 'rgba(255,133,133,0.4)',
		elevation: 2,
	},
	buttonContent: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		gap: 10,
	},
	buttonText: {
		color: colors.text,
		fontSize: fontSize.sm,
		fontWeight: '600',
		textAlign: 'center',
	},
	deleteButtonText: {
		color: '#ff8585',
		fontSize: fontSize.sm,
		fontWeight: '600',
		textAlign: 'center',
	},
	buttonClose: {
		position: 'absolute',
		right: 14,
		top: 14,
		width: 30,
		height: 30,
		borderRadius: 15,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'rgba(255,255,255,0.13)',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(255,255,255,0.32)',
	},
})
