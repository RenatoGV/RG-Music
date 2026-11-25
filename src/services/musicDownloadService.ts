import { requireNativeModule, type EventEmitter } from 'expo'
import { Platform } from 'react-native'
import { scheduleAlarmNotification } from '@/helpers/notifications'

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

export type MusicPlaylistResult = { title: string; tracks: MusicSearchResult[] }

type MusicDownloadNativeModule = EventEmitter<{
  onAudioDownloadProgress: (event: AudioDownloadProgress) => void
  onSharedMusic: () => void
}> & {
  searchYouTubeMusic: (query: string) => Promise<MusicSearchResult[]>
  resolveYouTubeMusic: (videoId: string) => Promise<MusicSearchResult>
  resolveYouTubePlaylist: (url: string) => Promise<MusicPlaylistResult>
  startDownloadService: (title: string) => void
  stopDownloadService: () => void
  takeSharedMusic?: () => string | null
  downloadAudio: (url: string, folderUri: string, fileName: string, quality: number, author: string, album: string, preserveTags: boolean) => Promise<{ uri: string; fileName: string }>
  cancelAudioDownload: () => void
}

let cachedModule: MusicDownloadNativeModule | null = null

const getModule = () => {
  if (Platform.OS !== 'android') throw new Error('La descarga está disponible solo en Android por ahora.')
  cachedModule ??= requireNativeModule<MusicDownloadNativeModule>('MusicImport')
  return cachedModule
}

export const searchYouTubeMusic = (query: string) => getModule().searchYouTubeMusic(query)

export const resolveYouTubeMusic = (videoId: string) => getModule().resolveYouTubeMusic(videoId)

export const getYouTubePlaylistUrl = (text: string) => {
  for (const link of text.match(/https?:\/\/[^\s<>"']+/gi) ?? []) {
    try {
      let cleanLink = link
      while (cleanLink.length && '.,)'.includes(cleanLink.at(-1) ?? '')) {
        cleanLink = cleanLink.slice(0, -1)
      }
      const url = new URL(cleanLink)
      if (!['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com', 'youtu.be'].includes(url.hostname)) continue
      const list = url.searchParams.get('list')
      if (list && /^[\w-]+$/.test(list)) return `https://www.youtube.com/playlist?list=${list}`
    } catch { continue }
  }
  return null
}

export const resolveYouTubePlaylist = (url: string) => getModule().resolveYouTubePlaylist(url)
export const startDownloadService = (title: string) => getModule().startDownloadService(title)
export const finishDownloadService = (title: string, message: string, notify: boolean) => {
  getModule().stopDownloadService()
  if (notify) void scheduleAlarmNotification({ title, message })
}

export const getYouTubeVideoId = (text: string) => {
  const link = text.match(/https?:\/\/[^\s<>"']+/gi) ?? []
  for (const url of link) {
    const shortId = /^https?:\/\/youtu\.be\/([\w-]{11})(?=[/?#&.,)]|$)/i.exec(url)?.[1]
    if (shortId) return shortId
    const path = /^https?:\/\/(?:(?:www|m|music)\.)?youtube\.com(\/[^#]*)/i.exec(url)?.[1]
    const videoId = /^\/watch\?(?:[^&]*&)*v=([\w-]{11})(?=[&.,)]|$)/.exec(path ?? '')?.[1]
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

export const downloadAudio = (url: string, folderUri: string, fileName: string, quality: number, author: string, album: string, preserveTags = false) =>
  getModule().downloadAudio(url, folderUri, fileName, quality, author, album, preserveTags)

export const cancelAudioDownload = () => getModule().cancelAudioDownload()

export const addDownloadProgressListener = (listener: (event: AudioDownloadProgress) => void) =>
  getModule().addListener('onAudioDownloadProgress', listener)
