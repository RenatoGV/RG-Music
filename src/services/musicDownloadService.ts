import { requireNativeModule, type EventEmitter } from 'expo'
import { Platform } from 'react-native'

export type MusicSearchResult = {
  id: string
  title: string
  artist: string
  album?: string | null
  duration: number
  artwork: string
  url: string
}

export type AudioDownloadProgress = {
  progress: number
  message: string | null
}

type MusicDownloadNativeModule = EventEmitter<{
  onAudioDownloadProgress: (event: AudioDownloadProgress) => void
}> & {
  searchYouTubeMusic: (query: string) => Promise<MusicSearchResult[]>
  downloadAudio: (url: string, folderUri: string, fileName: string, quality: number) => Promise<{ uri: string; fileName: string }>
  cancelAudioDownload: () => void
}

let cachedModule: MusicDownloadNativeModule | null = null

const getModule = () => {
  if (Platform.OS !== 'android') throw new Error('La descarga está disponible solo en Android por ahora.')
  if (!cachedModule) {
    cachedModule = requireNativeModule<MusicDownloadNativeModule>('MusicImport')
  }
  return cachedModule
}

export const searchYouTubeMusic = (query: string) => getModule().searchYouTubeMusic(query)

export const downloadAudio = (url: string, folderUri: string, fileName: string, quality: number) =>
  getModule().downloadAudio(url, folderUri, fileName, quality)

export const cancelAudioDownload = () => getModule().cancelAudioDownload()

export const addDownloadProgressListener = (listener: (event: AudioDownloadProgress) => void) =>
  getModule().addListener('onAudioDownloadProgress', listener)
