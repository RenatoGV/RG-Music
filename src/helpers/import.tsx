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
import * as FileSystem from "expo-file-system"

const audioExtensions = ['.mp3', '.wav', '.aac', '.m4a']
const MAX_METADATA_SIZE = 20 * 1024 * 1024 // 20 MB

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
    tracks : savedTracks,
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
      let tracks = [...(savedTracks ?? [])]
      tracks = tracks.filter(track => audioFiles.includes(track.url))

      const newAudioFiles = audioFiles.filter(
        file => !savedTracks?.some(track => track.url === file)
      )

      const totalAssets = newAudioFiles.length
      let currentProgress = 0
      
      for(const audio of newAudioFiles){
        try {
          currentProgress += 1 / totalAssets
          setProgressLoading(currentProgress)

          if (!audio) throw new Error('URI no existe')

          const fileName = getTemporaryFileName(audio)

          // 1) OBTENER info ANTES de crear cualquier copia temporal
          const info = await FileSystem.getInfoAsync(audio)
          let artist = 'Desconocido'
          let artwork = unknownTrackImageUri
          let tempPath: string | null = null

          // 2) Solo si size existe y es pequeño, hacemos la copia + metadata
          if (info.exists && 'size' in info && typeof info.size === 'number' && info.size <= MAX_METADATA_SIZE) {
            try {
              tempPath = await getTemporaryFile(audio, fileName, tempDir)
              if (tempPath) {
                const { metadata } = await getAudioMetadata(
                  `file://${tempPath}`,
                  ['artist', 'artwork', 'name']
                )
                artist = metadata.artist || 'Desconocido'
                artwork = metadata.artwork || unknownTrackImageUri
              }
            } catch (metaErr) {
              console.warn("Error leyendo metadata o creando temp, usando fallback:", metaErr)
            } finally {
              // limpiamos temp si fue creado
              if (tempPath) {
                try {
                  await unlink(tempPath)
                } catch (unlinkError) {
                  console.warn('Error al eliminar temporal:', unlinkError)
                }
                tempPath = null
              }
            }
          } else {
            // Si size es undefined (content://) o demasiado grande -> NO copiamos ni intentamos metadata
            console.log(`Archivo demasiado grande o sin size disponible (size: ${(info as any).size}), omitiendo metadata y copia temporal`)
          }

          // 3) push con lo que tengamos (metadata o fallback)
          tracks.push({
            title: removeExtension(fileName),
            url: audio,
            artist,
            artwork
          })
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
        showToast(`${newAudioFiles.length} canciones agregadas`)
      } else {
        await scheduleAlarmNotification({title: 'Canciones importadas', message: `${newAudioFiles.length} canciones agregadas`})  
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
