import { unknownTrackImageUri } from '@/constants/images'
import { colors, fontSize, screenPadding } from '@/constants/tokens'
import { defaultStyles, utilsStyles } from '@/styles'
import { ActivityIndicator, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useActiveTrack } from 'react-native-track-player'
import { Track } from '@/helpers/types'
import { FontAwesome } from '@expo/vector-icons'
import { PlayerControls } from '@/components/player/PlayerControls'
import { PlayerProgressbar } from '@/components/player/PlayerProgressbar'
import { PlayerVolumenbar } from '@/components/player/PlayerVolumenbar'
import { PlayerRepeatToggle } from '@/components/player/PlayerRepeatToggle'
import { usePlayerBackground } from '@/hooks/usePlayerBackground'
import { LinearGradient } from 'expo-linear-gradient'
import { useTrackPlayerFavorite } from '@/hooks/useTrackPlayerFavorite'
import { useEffect, useState } from 'react'
import { Lyrics } from '@/components/player/Lyrics'
import { ArtworkFlip } from '@/components/player/ArtworkFlip'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { MovingText } from '@/components/other/MovingText'
import { useLyricStore } from '@/store/lyrics'
import { AnimatedTitle } from '@/components/lyrics/AnimatedTitle'
import { PlayerControlsLyrics } from '@/components/lyrics/PlayerControlsLyrics'
import { AnimatedSubitle } from '@/components/lyrics/AnimatedSubtitle'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { TextInput } from 'react-native-gesture-handler'
import { useModalStore } from '@/store/modal'
import { FontAwesome6 } from '@expo/vector-icons'
import { showToast } from '@/helpers/toast'
import { useLibraryStore } from '@/store/library'
import { router } from 'expo-router'


const PlayerScreen = () => {
    const activeTrackRaw = useActiveTrack()
    const tracks = useLibraryStore(state => state.tracks)
    
    const activeTrack = activeTrackRaw && tracks 
        ? tracks.find(t => t.url === activeTrackRaw.url) ?? (activeTrackRaw as Track)
        : (activeTrackRaw as Track | undefined)
    
    const { imageColors } = usePlayerBackground(activeTrack?.artwork ?? unknownTrackImageUri)
    const { showLyrics, setShowLyrics } = useLyricStore()
    const { updateTrackLyricId } = useLibraryStore()

    const { top, bottom } = useSafeAreaInsets()
    
    const { isFavorite, toggleFavorite } = useTrackPlayerFavorite()

    const [ modalVisible, setModalVisible ] = useState(false)
    const [ lyricId, setLyricId ] = useState(activeTrack?.lyric_id || '')
    const handleSave = () => {
        if (activeTrack) {
            updateTrackLyricId(activeTrack.url, lyricId.trim())
            showToast("Lyric ID establecido")
            closeModal()
        }
    }
    const closeModal = () => {
        setModalVisible(false)
    }
	const handleChangeText = (value: string) => {
		setLyricId(value)
	}

    useEffect(() => {
        setLyricId(activeTrack?.lyric_id || '')
    },[activeTrack])

    useEffect(() => {
        if(showLyrics){
            activateKeepAwakeAsync('rg-music')
        }else{
            deactivateKeepAwake('rg-music')
        }
    }, [showLyrics])

    if(!activeTrack) {
        return (
            <View style={[defaultStyles.container, {justifyContent: 'center'}]}>
                <ActivityIndicator color={colors.icon} />
            </View>
        )
    }

  return (
    <LinearGradient style={{flex: 1}} colors={imageColors ? [imageColors.average, imageColors.vibrant] : [colors.primary, colors.secondary, colors.background]}>
        <Modal
            animationType="fade"
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
                    <Text style={styles.modalText}>Establecer Lyric ID</Text>
                    <TextInput
                        style={styles.modalInput}
                        placeholder="Ingrese el ID"
                        selectionColor={colors.primary}
                        placeholderTextColor={colors.textMuted}
                        onChangeText={handleChangeText}
                        value={lyricId}
                    />
                    <TouchableOpacity
                        style={[styles.button, styles.buttonSave, { opacity: 1 }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.textStyle}>Guardar</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
        <View style={styles.overlayContainer}>
            {(showLyrics) ? <></> : <DismissPlayerSymbol />}

            <View style={{flex: 1, marginTop: (showLyrics) ? top : top + 70, marginBottom: bottom}}>
                {
                    (showLyrics)
                    ? 
                        <View style={{flex: 1, justifyContent: 'space-between', paddingBottom: 20}}>
                            <View style={{marginBottom: 30}}>
                                <AnimatedTitle text={activeTrack.title ?? ''} />
                                <TouchableOpacity  onPress={
                                    () => router.navigate((activeTrack.artist?.includes('/')) ? '/(tabs)/artists' : `/(tabs)/artists/${activeTrack.artist}`)
                                }>
                                    <AnimatedSubitle text={activeTrack.artist ?? ''} />
                                </TouchableOpacity>
                                
                            </View>
                            <Lyrics 
                                artist={activeTrack.artist} 
                                track={activeTrack.title}
                                lyricId={activeTrack.lyric_id}
                            />
                            <View style={{marginTop: 30}}>
                                <PlayerProgressbar />
                                <PlayerControlsLyrics />
                            </View>
                        </View>
                    : <>
                        <ArtworkFlip artwork={activeTrack.artwork} unknownTrackImageUri={unknownTrackImageUri} onPress={() => setShowLyrics(true)} />

                        <View style={{flex: 1}}>
                            <View style={{marginTop: 'auto'}}>
                                <View style={{height: 60}}>
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                        <View style={styles.trackTitleContainer}>
                                            <MovingText text={activeTrack.title ?? ''} animationThreshold={30} style={styles.trackTitleText} />
                                        </View>

                                        <TouchableOpacity onPress={() => {setModalVisible(true)}}>
                                            <MaterialIcons
                                                name="info-outline"
                                                size={30} 
                                                color={colors.icon}
                                                style={{marginHorizontal: 14}}
                                            />
                                        </TouchableOpacity>

                                        <TouchableOpacity onPress={toggleFavorite}>
                                            <FontAwesome
                                                name={isFavorite ? 'heart' : 'heart-o'}
                                                size={30}
                                                color={isFavorite ? colors.primary : colors.icon}
                                                style={{marginHorizontal: 14}}
                                            />
                                        </TouchableOpacity>
                                    </View>

                                    {activeTrack.artist && (
                                        <TouchableOpacity
                                            onPress={() => router.navigate((activeTrack.artist?.includes('/')) ? '/(tabs)/artists' : `/(tabs)/artists/${activeTrack.artist}`)}
                                        >
                                            <Text 
                                                numberOfLines={1} 
                                                style={[styles.trackArtistText, {marginTop: 6}]}
                                                >
                                            {activeTrack.artist}</Text>
                                        </TouchableOpacity>
                                    )}
                                </View>

                                <PlayerProgressbar style={{marginTop: 32}} />
                                <PlayerControls style={{marginTop: 40}} />
                            </View>

                            <PlayerVolumenbar style={{marginTop: 'auto', marginBottom: 30}} />

                            <View style={utilsStyles.centeredRow}>
                                <PlayerRepeatToggle size={30} style={{marginBottom: 6}} />
                            </View>
                        </View>
                    </>
                }
            </View>
        </View>
    </LinearGradient>
  )
}

const DismissPlayerSymbol = () => {
    const {top} = useSafeAreaInsets()

    return (
        <View style={{
            position: 'absolute',
            top: top + 8,
            left: 0,
            right: 0,
            flexDirection: 'row',
            justifyContent: 'center'
        }}>
            <View accessible={false} style={{
                width: 50,
                height: 8,
                borderRadius: 8,
                backgroundColor: '#fff',
                opacity: 0.7
            }} />
        </View>
    )
}

const styles = StyleSheet.create({
    overlayContainer: {
        ...defaultStyles.container,
        paddingHorizontal: screenPadding.horizontal,
        backgroundColor: 'rgba(0,0,0,0.5)'
    },
    artworkImageContainer: {
        shadowOffset: {
            width: 0,
            height: 8
        },
        shadowOpacity: 0.44,
        shadowRadius: 11.0,
        flexDirection: 'row',
        justifyContent: 'center',
        height: '45%'
    },
    artworkImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 12
    },
    trackTitleContainer: {
        flex: 1,
        overflow: 'hidden'
    },
    trackTitleText: {
        ...defaultStyles.text,
        fontSize: 22,
        fontWeight: '700'
    },
    trackArtistText: {
        ...defaultStyles.text,
        fontSize: fontSize.base,
        opacity: 0.8,
        maxWidth: '90%'
    },
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

export default PlayerScreen