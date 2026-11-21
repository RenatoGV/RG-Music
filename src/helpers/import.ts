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
import { lyricsService } from "@/services/lyricsService"
import { getAudioDuration } from "@/helpers/audioDuration"

const audioExtensions = ['.mp3', '.wav', '.aac', '.m4a']
const MAX_METADATA_SIZE = 20 * 1024 * 1024 // 20 MB

const removeExtension = (fileName : string) => {
  const extensionIndex = fileName.lastIndexOf('.')
  if (extensionIndex <= 0) return fileName

  const extension = fileName.slice(extensionIndex).toLowerCase()
  return audioExtensions.includes(extension)
    ? fileName.slice(0, extensionIndex)
    : fileName
}

type ImportMode = 'refresh' | 'replace'

export const importTracks = async (uri: string | null, mode: ImportMode = 'refresh') => {
  const { tracks : savedTracks, setTracks, setIsLoading, setProgressLoading, resetProgressLoading } = useLibraryStore.getState()

  resetProgressLoading()
  let tempDir = ''
  let loadingStarted = false

  try {
    if (uri !== null) {
      tempDir = await createTempSessionDir()
      setIsLoading(true)
      loadingStarted = true
      
      const files = await StorageAccessFramework.readDirectoryAsync(uri)
      const audioFiles = files.filter(name =>
        audioExtensions.some(ext => name.toLowerCase().endsWith(ext))
      )

      const audioFileSet = new Set(audioFiles)
      const previousTracks = savedTracks ?? []
      const isReplacing = mode === 'replace'

      const tracks = isReplacing
        ? []
        : previousTracks
            .filter(track => audioFileSet.has(track.url))
            .map(track => ({ ...track, title: removeExtension(getTemporaryFileName(track.url)) }))

      const savedTrackUrls = new Set(tracks.map((track) => track.url))
      const filesToImport = audioFiles.filter((file) => !savedTrackUrls.has(file))
      const removedCount = previousTracks.filter((track) => !audioFileSet.has(track.url)).length

      const totalAssets = filesToImport.length
      let currentProgress = 0
      
      /* eslint-disable no-await-in-loop */
      for(const audio of filesToImport){
        try {
          if (!audio) throw new Error('URI no existe')

          const fileName = getTemporaryFileName(audio)
          const info = await FileSystem.getInfoAsync(audio)

          let title = removeExtension(fileName)
          let artist = 'Desconocido'
          let artwork = unknownTrackImageUri
          let duration = await getAudioDuration(audio)
          let tempPath: string | null = null

          if (info.exists && 'size' in info && typeof info.size === 'number' && info.size <= MAX_METADATA_SIZE) {
            try {
              tempPath = await getTemporaryFile(audio, fileName, tempDir)
              
              if (tempPath) {
                const { metadata } = await getAudioMetadata(
                  `file://${tempPath}`,
                  ['artist', 'artwork']
                )
                artist = metadata.artist || artist
                artwork = metadata.artwork || artwork
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
            title,
            url: audio,
            artist,
            artwork,
            duration,
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
            duration: await getAudioDuration(audio),
          })
        } finally {
          currentProgress += 1 / totalAssets
          setProgressLoading(currentProgress)
        }
      }
      /* eslint-enable no-await-in-loop */

      setTracks(tracks)
      saveData('tracks', tracks)
      saveData('selectedAlbum', uri)

      /* Eliminar lyrics antiguas */
      const importedUrls = new Set(tracks.map((track) => track.url))
      for(const previousTrack of savedTracks ?? []) {
        if(!importedUrls.has(previousTrack.url)) {
          lyricsService.removeCachedLyrics(previousTrack.url)
        }
      }

      let message = 'La biblioteca ya está actualizada'

      if(isReplacing) message = `${tracks.length} canciones importadas`
      else if(totalAssets > 0 || removedCount > 0) message = `Importadas: ${totalAssets} · Retiradas: ${removedCount}`

      console.info('[IMPORT] Importación completada', {
        mode,
        imported: totalAssets,
        removed: removedCount,
        totalTracks: tracks.length
      })

      if(AppState.currentState === 'active'){
        showToast(message)
      } else {
        await scheduleAlarmNotification({title: 'Biblioteca de música', message})
      }
    }
  } catch (error) {
    console.error('[IMPORT] Error cargando la carpeta seleccionada', { uri, error })
    const message = 'No se pudo completar la importación'

    if (AppState.currentState === 'active') {
      showToast(message)
    } else {
      await scheduleAlarmNotification({ title: 'Biblioteca de música', message })
    }
  } finally {
    try {
      if(tempDir) {
        await deleteTempSessionDir(tempDir)
        console.log('Carpeta temporal eliminada:', tempDir)
      }
    } catch (cleanupError) {
      console.warn('Error al eliminar la carpeta temporal:', cleanupError)
    } finally {
      if(loadingStarted) setIsLoading(false)
    }
  }
}
