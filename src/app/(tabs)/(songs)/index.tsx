import { colors, fontSize, screenPadding } from '@/constants/tokens'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { defaultStyles, utilsStyles } from '@/styles'
import { ActivityIndicator, Button, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useMemo } from 'react'
import { trackTitleFilter } from '@/helpers/filter'
import { useLibraryStore, useTracks } from '@/store/library'
import { generateTrackListId } from '@/helpers/miscellaneous'
import { useRouter } from 'expo-router'
import { Ionicons } from "@expo/vector-icons"
import FastImage from 'react-native-fast-image'
import { unknownTrackImageUri } from '@/constants/images'
import { FontAwesome6 } from "@expo/vector-icons"
import { useModalStore } from '@/store/modal'
import { Album } from 'expo-media-library'
import { TracksList } from '@/components/track/TracksList'
import { importTracks } from '@/helpers/import'
import { loadData } from '@/helpers/storage'
import { Circle } from 'react-native-progress'

const SongsScreen = () => {
  const { modalFolderVisible, setModalFolderVisible } = useModalStore()
  const { isLoading, progressLoading } = useLibraryStore()

  const handleRefreshSongs = async () => {
    closeModal()
    try {
      const album : Album | null = await loadData('selectedAlbum')

      await importTracks(album)
    } catch (error) {
      console.error('Error loading selectedAlbum', error)
    }
  }

  const closeModal = () => {
    setModalFolderVisible(false)
  }

  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: 'Buscar en Canciones'
    }
  })

  const router = useRouter()

  const handleSelectFolder = () => {
    closeModal()
    router.push({pathname: '/(modals)/selectFolder'})
  }

  const tracks = useTracks()

  const filteredTracks = useMemo(() => {
    if(!tracks) return []
    
    tracks.sort((a, b) => a.title!.localeCompare(b.title!))

    if(!search) return tracks

    return tracks.filter(trackTitleFilter(search))
  }, [search, tracks])

  if(isLoading) return (
    <View style={{flex: 1, backgroundColor: colors.background, paddingHorizontal: screenPadding.horizontal, justifyContent: 'center', alignItems: 'center'}}>
      <Circle progress={progressLoading} size={150} showsText color={colors.primary} />
    </View>
  )

  if(!tracks) return (
    <View style={{...defaultStyles.container, paddingHorizontal: screenPadding.horizontal}}>
      <Text style={utilsStyles.emptyContentText}>No se encontraron canciones</Text>
      <Text style={{color: colors.textMuted, fontSize: fontSize.sm, textAlign: 'center', marginBottom: 10}}>Seleccione la carpeta donde se encuentren las canciones (.mp3 o .wav)</Text>
      <FastImage
        source={{ uri: unknownTrackImageUri, priority: FastImage.priority.normal }}
        style={utilsStyles.emptyContentImage}
      />
      <TouchableOpacity onPress={handleSelectFolder} activeOpacity={0.8} style={styles.button}>
          <Ionicons name="folder-outline" size={22} color={colors.primary} />
          <Text style={styles.buttonText}>Seleccionar carpeta</Text>
      </TouchableOpacity>
  </View>
  )

  return (
    <View style={{...defaultStyles.container, paddingHorizontal: screenPadding.horizontal}}>

      <TracksList id={generateTrackListId('songs', search)} tracks={filteredTracks} />

      <Modal
          animationType="slide"
          transparent={true}
          visible={modalFolderVisible}
          onRequestClose={() => {
            setModalFolderVisible(!modalFolderVisible);
          }}>
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <TouchableOpacity onPress={closeModal} style={styles.buttonClose}>
                <FontAwesome6 name="circle-xmark" size={22} color={colors.primary} />
              </TouchableOpacity>
              <View style={{gap: 15}}>
                <TouchableOpacity
                  style={[styles.bodalButton, styles.buttonSave]}
                  onPress={handleRefreshSongs}>
                  <Text style={styles.textStyle}>Actualizar lista de canciones</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.bodalButton, styles.buttonSave]}
                  onPress={handleSelectFolder}>
                  <Text style={styles.textStyle}>Seleccionar carpeta de canciones</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
        columnGap: 8
    },
    buttonText: {
        ...defaultStyles.text,
        color: colors.primary,
        fontWeight: '600',
        fontSize: 18,
        textAlign: 'center'
    },

    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    modalView: {
      width: '70%',
      margin: 20,
      backgroundColor: '#1c1c1c',
      borderRadius: 20,
      padding: 35,
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
    bodalButton: {
      borderRadius: 10,
      padding: 10,
      elevation: 2,
      paddingHorizontal: 20
    },
    buttonClose: {
      position: 'absolute',
      right: 12,
      top: 12
    },
    buttonSave: {
      backgroundColor: colors.primary
    },
    textStyle: {
      color: 'white',
      fontWeight: 'bold',
      textAlign: 'center',
    },
    modalInput: {
      width: '80%',
      marginBottom: 15,
      backgroundColor: colors.secondary,
      fontSize: fontSize.sm,
      borderRadius: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      color: colors.text
    }
})

export default SongsScreen