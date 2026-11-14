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
      const savedTracksByUrl = new Map((savedTracks ?? []).map(track => [track.url, track] as const))

      let tracks = (savedTracks ?? []).filter(track => audioFileSet.has(track.url))

      const newAudioFiles = audioFiles.filter(
        file => !savedTracksByUrl.has(file)
      )

      const incompleteMetadataFiles = new Set(
        (savedTracks ?? []).filter(track =>
            audioFiles.includes(track.url) &&
            (!track.title || track.title === removeExtension(getTemporaryFileName(track.url)) || !track.artist || track.artist === 'Desconocido'
            || !track.artwork || track.artwork === unknownTrackImageUri)
          )
          .map(track => track.url)
      )

      const filesToProcess = audioFiles.filter(
        file => !savedTracksByUrl.has(file) || incompleteMetadataFiles.has(file)
      )

      tracks = tracks.filter(track => !incompleteMetadataFiles.has(track.url))

      const totalAssets = filesToProcess.length
      let currentProgress = 0
      
      /* eslint-disable no-await-in-loop */
      for(const audio of filesToProcess){
        try {
          if (!audio) throw new Error('URI no existe')

          const fileName = getTemporaryFileName(audio)
          const existingTrack = savedTracksByUrl.get(audio)

          const info = await FileSystem.getInfoAsync(audio)
          let title = existingTrack?.title || removeExtension(fileName)
          let artist = existingTrack?.artist || 'Desconocido'
          let artwork = existingTrack?.artwork || unknownTrackImageUri
          let tempPath: string | null = null

          if (info.exists && 'size' in info && typeof info.size === 'number' && info.size <= MAX_METADATA_SIZE) {
            try {
              tempPath = await getTemporaryFile(audio, fileName, tempDir)
              
              if (tempPath) {
                const { metadata } = await getAudioMetadata(
                  `file://${tempPath}`,
                  ['artist', 'artwork', 'name']
                )
                title = metadata.name?.trim() || title
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
            artwork
          })
        } catch (error) {
          const existingTrack = savedTracks?.find(track => track.url === audio)
          
          console.error('[IMPORT] Error procesando archivo; se agregará con valores de fallback', {
            fileName: getTemporaryFileName(audio),
            uriScheme: audio.split(':')[0],
            error,
          })
          
          tracks.push(existingTrack ?? {
            title: removeExtension(getTemporaryFileName(audio)),
            url: audio,
            artist: 'Desconocido',
            artwork: unknownTrackImageUri,
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

      console.info('[IMPORT] Importación completada', {
        added: newAudioFiles.length,
        updated: incompleteMetadataFiles.size,
        processed: filesToProcess.length,
        totalTracks: tracks.length,
      })

      if(AppState.currentState === 'active'){
        showToast(`${filesToProcess.length} canciones importadas o actualizadas`)
      } else {
        await scheduleAlarmNotification({title: 'Canciones importadas', message: `${filesToProcess.length} canciones importadas o actualizadas`})
      }
    }
  } catch (error) {
    console.error('[IMPORT] Error cargando la carpeta seleccionada', { uri, error })
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
