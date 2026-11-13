import { unknownTrackImageUri } from "@/constants/images"
import { showToast } from "./toast"
import { useLibraryStore } from "@/store/library"
import { saveData } from "./storage"
import { getAudioMetadata } from "@missingcore/audio-metadata"
import { AppState } from "react-native"
import { scheduleAlarmNotification } from "./notifications"
import { StorageAccessFramework } from 'expo-file-system/legacy';
import { createTempSessionDir, deleteTempSessionDir, getTemporaryFile, getTemporaryFileName } from "./temporary-file"
import * as FileSystem from "expo-file-system/legacy"

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

  console.info('[IMPORT] Inicio de importación', { directoryUri: uri })

  try {
    if (uri !== null) {
      tempDir = await createTempSessionDir()
      setIsLoading(true)
      
      const files = await StorageAccessFramework.readDirectoryAsync(uri)
      console.info('[IMPORT] Archivos encontrados en la carpeta', { count: files.length })
      const audioFiles = files.filter(name =>
        audioExtensions.some(ext => name.toLowerCase().endsWith(ext))
      )
      console.info('[IMPORT] Archivos de audio detectados', {
        count: audioFiles.length,
        extensions: audioFiles.map(file => getTemporaryFileName(file).split('.').pop()?.toLowerCase()),
      })
      let tracks = [...(savedTracks ?? [])]
      tracks = tracks.filter(track => audioFiles.includes(track.url))

      const newAudioFiles = audioFiles.filter(
        file => !savedTracks?.some(track => track.url === file)
      )
      console.info('[IMPORT] Resultado de deduplicación', {
        alreadyImported: audioFiles.length - newAudioFiles.length,
        newFilesToProcess: newAudioFiles.length,
      })

      const totalAssets = newAudioFiles.length
      let currentProgress = 0
      
      for(const audio of newAudioFiles){
        try {
          currentProgress += 1 / totalAssets
          setProgressLoading(currentProgress)

          if (!audio) throw new Error('URI no existe')

          const fileName = getTemporaryFileName(audio)
          console.info('[IMPORT] Procesando archivo', {
            fileName,
            uriScheme: audio.split(':')[0],
          })

          const info = await FileSystem.getInfoAsync(audio)
          let artist = 'Desconocido'
          let artwork = unknownTrackImageUri
          let tempPath: string | null = null
          console.info('[IMPORT] Información del archivo', {
            fileName,
            exists: info.exists,
            size: info.exists && 'size' in info ? info.size : null,
          })

          if (info.exists && 'size' in info && typeof info.size === 'number' && info.size <= MAX_METADATA_SIZE) {
            try {
              tempPath = await getTemporaryFile(audio, fileName, tempDir)
              console.info('[IMPORT] Copia temporal lista; leyendo metadatos', {
                fileName,
                tempPath,
              })
              if (tempPath) {
                const { metadata } = await getAudioMetadata(
                  `file://${tempPath}`,
                  ['artist', 'artwork', 'name']
                )
                artist = metadata.artist || 'Desconocido'
                artwork = metadata.artwork || unknownTrackImageUri
                console.info('[IMPORT] Resultado de lectura de metadatos', {
                  fileName,
                  name: metadata.name ?? null,
                  artist: metadata.artist ?? null,
                  hasArtwork: Boolean(metadata.artwork),
                  artworkBase64Length: metadata.artwork?.length ?? 0,
                })
              }
            } catch (metaErr) {
              console.warn('[IMPORT] Error leyendo metadatos o creando temporal; se usará fallback', {
                fileName,
                error: metaErr,
              })
            } finally {
              if (tempPath) {
                try {
                  await FileSystem.deleteAsync(`file://${tempPath}`, { idempotent: true })
                } catch (unlinkError) {
                  console.warn('Error al eliminar temporal:', unlinkError)
                }
                tempPath = null
              }
            }
          } else {
            console.log(`Archivo demasiado pesado (size: ${(info as any).size}). Se omitió la metadata`)
          }

          tracks.push({
            title: removeExtension(fileName),
            url: audio,
            artist,
            artwork
          })
          console.info('[IMPORT] Track agregado', {
            fileName,
            artist,
            hasArtwork: artwork !== unknownTrackImageUri,
          })
        } catch (error) {
          console.error('[IMPORT] Error procesando archivo; se agregará con valores de fallback', {
            fileName: getTemporaryFileName(audio),
            uriScheme: audio.split(':')[0],
            error,
          })
          
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
      console.info('[IMPORT] Importación completada', {
        added: newAudioFiles.length,
        totalTracks: tracks.length,
      })

      if(AppState.currentState === 'active'){
        showToast(`${newAudioFiles.length} canciones agregadas`)
      } else {
        await scheduleAlarmNotification({title: 'Canciones importadas', message: `${newAudioFiles.length} canciones agregadas`})  
      }

      setIsLoading(false)
    }
  } catch (error) {
    console.error('[IMPORT] Error cargando la carpeta seleccionada', { uri, error })
  } finally {
    if(tempDir) {
      await deleteTempSessionDir(tempDir)
      console.log('Carpeta temporal eliminada:', tempDir)
    }
  }
}
