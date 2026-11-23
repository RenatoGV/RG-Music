import { useContext, useState } from 'react'
import { Keyboard, Modal, Pressable, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { FontAwesome6 } from '@expo/vector-icons'
import { colors, fontSize } from '@/constants/tokens'
import { LiquidGlassSurface } from '@/components/glass/LiquidGlassSurface'
import { LiquidGlassBlurTargetRefContext } from '@/components/glass/LiquidGlassBlurTarget'
import { PrimaryGlassButton } from '@/components/common/PrimaryGlassButton'
import { LiquidGlassButton } from '@/components/common/LiquidGlassButton'

interface CreatePlaylistModalProps {
	visible: boolean
	onClose: () => void
	onCreate: (name: string) => boolean
}

const CreatePlaylistModal = ({ visible, onClose, onCreate }: Readonly<CreatePlaylistModalProps>) => {
	const [playlistName, setPlaylistName] = useState('')
	const blurTarget = useContext(LiquidGlassBlurTargetRefContext)
	const trimmedName = playlistName.trim()
	const isDisabled = trimmedName.length === 0

	const handleClose = () => {
		Keyboard.dismiss()
		setPlaylistName('')
		onClose()
	}

	const handleSave = () => {
		if (isDisabled) return

		if (onCreate(trimmedName)) handleClose()
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
							<Text style={styles.title}>Crear playlist</Text>
							<Text style={styles.description}>
								Dale un nombre a tu playlist para organizar tus canciones favoritas.
							</Text>
						</View>

						<TextInput
							accessibilityLabel="Nombre de la playlist"
							value={playlistName}
							style={styles.modalInput}
							placeholder="Nombre de la playlist"
							selectionColor={colors.primary}
							placeholderTextColor={colors.textMuted}
							autoCapitalize="sentences"
							autoCorrect={false}
							returnKeyType="done"
							onSubmitEditing={handleSave}
							onChangeText={setPlaylistName}
						/>

						<View style={styles.actions}>
							<PrimaryGlassButton
								accessibilityRole="button"
								disabled={isDisabled}
								style={[styles.modalButton, isDisabled && styles.disabledButton]}
								onPress={handleSave}
							>
								<View style={styles.buttonContent}>
									<FontAwesome6 name="plus" size={16} color={colors.text} />
									<Text style={styles.buttonText}>Crear playlist</Text>
								</View>
							</PrimaryGlassButton>

							<LiquidGlassButton style={styles.modalButton} onPress={handleClose}>
								<View style={styles.buttonContent}>
									<FontAwesome6 name="xmark" size={16} color={colors.text} />
									<Text style={styles.buttonText}>Cancelar</Text>
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
		marginBottom: 18,
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
	modalInput: {
		width: '100%',
		minHeight: 48,
		marginBottom: 18,
		paddingHorizontal: 14,
		borderRadius: 12,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: 'rgba(255,255,255,0.22)',
		backgroundColor: 'rgba(0,0,0,0.18)',
		color: colors.text,
		fontSize: fontSize.sm,
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
	disabledButton: {
		opacity: 0.45,
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

export default CreatePlaylistModal
