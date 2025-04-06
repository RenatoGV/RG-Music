import { unknownTrackImageUri } from "@/constants/images"
import { showToast } from "./toast"
import { useLibraryStore } from "@/store/library"
import { saveData } from "./storage"
import { getAudioMetadata } from "@missingcore/audio-metadata"
import { AppState } from "react-native"
import { scheduleAlarmNotification } from "./notifications"
import { StorageAccessFramework } from 'expo-file-system';
import { createTempSessionDir, deleteTempSessionDir, getTemporaryFile, getTemporaryFileName } from "./temporary-file"
import { unlink } from "react-native-fs"


const audioExtensions = ['.mp3', '.wav', '.aac', '.m4a']

const removeExtension = (fileName : string) => {
  for(const ext of audioExtensions) {
    if (fileName.endsWith(ext)) {
      return fileName.slice(0, -ext.length)
    }
  }
  return fileName
}

export const importTracks = async (uri: string | null) => {
  const {
    setTracks,
    setIsLoading,
    setProgressLoading,
    resetProgressLoading
  } = useLibraryStore.getState()

  resetProgressLoading()
  let tempDir = ''

  try {
    if (uri !== null) {
      tempDir = await createTempSessionDir()
      setIsLoading(true)
      
      const files = await StorageAccessFramework.readDirectoryAsync(uri)
      const audioFiles = files.filter(name =>
        audioExtensions.some(ext => name.toLowerCase().endsWith(ext))
      )

      audioFiles[0]

      const totalAssets = audioFiles.length
      let currentProgress = 0
      const tracks = []
      
      for(const audio of audioFiles){
        try {
          currentProgress += 1 / totalAssets
          setProgressLoading(currentProgress)

          if (!audio) throw new Error('URI no existe')

          const fileName = getTemporaryFileName(audio)

          const tempPath = await getTemporaryFile(
            audio,
            fileName,
            tempDir
          )
          
          const { metadata } = await getAudioMetadata(
            `file://${tempPath}`,
            ['artist', 'artwork', 'name']
          )
          
          tracks.push({
            title: removeExtension(fileName),
            url: audio,
            artist: metadata.artist || 'Desconocido',
            artwork: metadata.artwork || unknownTrackImageUri
          })
          
          if (tempPath) {
            try {
              await unlink(tempPath)
            } catch (unlinkError) {
              console.warn('Error al eliminar temporal:', unlinkError)
            }
          }
        } catch (error) {
          console.log('Error procesando track:', audio, error)
          
          tracks.push({
            title: removeExtension(getTemporaryFileName(audio)),
            url: audio,
            artist: 'Desconocido',
            artwork: unknownTrackImageUri,
          })
        }
      }

      setTracks(tracks)
      saveData('tracks', tracks)
      saveData('selectedAlbum', uri)

      if(AppState.currentState === 'active'){
        showToast(`${tracks.length} canciones cargadas`)
      } else {
        await scheduleAlarmNotification({title: 'Caniones importadas', message: `${tracks.length} canciones cargadas`})  
      }

      setIsLoading(false)
    }
  } catch (error) {
    console.error('Error loading selectedAlbum', error)
  } finally {
    if(tempDir) {
      await deleteTempSessionDir(tempDir)
      console.log('Carpeta temporal eliminada:', tempDir)
    }
  }
}