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
  onSharedMusic: () => void
}> & {
  searchYouTubeMusic: (query: string) => Promise<MusicSearchResult[]>
  resolveYouTubeMusic: (videoId: string) => Promise<MusicSearchResult>
  takeSharedMusic?: () => string | null
  downloadAudio: (url: string, folderUri: string, fileName: string, quality: number, author: string, album: string) => Promise<{ uri: string; fileName: string }>
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

export const resolveYouTubeMusic = (videoId: string) => getModule().resolveYouTubeMusic(videoId)

export const getYouTubeVideoId = (text: string) => {
  const link = text.match(/https?:\/\/[^\s<>"']+/gi) ?? []
  for (const url of link) {
    const shortId = url.match(/^https?:\/\/youtu\.be\/([\w-]{11})(?=[/?#&.,)]|$)/i)?.[1]
    if (shortId) return shortId
    const path = url.match(/^https?:\/\/(?:(?:www|m|music)\.)?youtube\.com(\/[^#]*)/i)?.[1]
    const videoId = path?.match(/^\/watch\?(?:[^&]*&)*v=([\w-]{11})(?=[&.,)]|$)/)?.[1]
      ?? path?.match(/^\/(?:shorts|live)\/([\w-]{11})(?=[/?&.,)]|$)/)?.[1]
    if (videoId) return videoId
  }
  return null
}

export const subscribeToSharedMusic = (listener: (text: string) => void) => {
  const module = getModule()
  if (!module.takeSharedMusic) return
  const deliver = () => {
    const text = module.takeSharedMusic?.()
    if (text) listener(text)
  }
  const subscription = module.addListener('onSharedMusic', deliver)
  deliver()
  return () => subscription.remove()
}

export const downloadAudio = (url: string, folderUri: string, fileName: string, quality: number, author: string, album: string) =>
  getModule().downloadAudio(url, folderUri, fileName, quality, author, album)

export const cancelAudioDownload = () => getModule().cancelAudioDownload()

export const addDownloadProgressListener = (listener: (event: AudioDownloadProgress) => void) =>
  getModule().addListener('onAudioDownloadProgress', listener)
