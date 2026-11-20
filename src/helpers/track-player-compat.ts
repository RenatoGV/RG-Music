import { useEffect, useMemo } from 'react'
import TrackPlayerV5, {
  Event as V5Event,
  PlayerCommand,
  RepeatMode as V5RepeatMode,
  useActiveMediaItem,
  useIsPlaying as useIsPlayingV5,
  useProgress as useProgressV5,
  type MediaItem,
} from '@rntp/player'

export type Track = {
  title: string
  url: string
  artist?: string
  artwork?: string
  rating?: number
  duration?: number | null
  addedAt?: number
  lyric_id?: string
  playlist?: string[]
}

type SetupPlayerOptions = {
  maxCacheSize?: number
  contentType?: 'music' | 'speech'
  audioMixing?: 'exclusive' | 'mix'
}

export enum Event {
  PlaybackError = 'playback-error',
  PlaybackState = 'playback-state',
  PlaybackActiveTrackChanged = 'playback-active-track-changed',
}

export enum RepeatMode {
  Off = 'off',
  Track = 'one',
  Queue = 'all',
}

export enum Capability {
  Play = 'play',
  Pause = 'pause',
  SkipToNext = 'next',
  SkipToPrevious = 'previous',
}

export enum RatingType {
  Heart = 'heart',
}

const toMediaItem = (track: Track): MediaItem => ({
  mediaId: track.url,
  url: track.url,
  title: track.title,
  artist: track.artist,
  artworkUrl: track.artwork,
  duration: typeof track.duration === 'number' ? track.duration : undefined,
  extras: { rating: track.rating, lyric_id: track.lyric_id, addedAt: track.addedAt },
})

const fromMediaItem = (item: MediaItem | null | undefined): Track | undefined => {
  if (!item) return undefined
  const extras = item.extras ?? {}
  const artworkUrl = item.artworkUrl
  const artwork = typeof artworkUrl === 'string'
    ? artworkUrl
    : artworkUrl && typeof artworkUrl === 'object' && 'uri' in artworkUrl
      ? String(artworkUrl.uri)
      : undefined
  const url = typeof item.url === 'string'
    ? item.url
    : item.url && typeof item.url === 'object' && 'uri' in item.url
      ? String(item.url.uri)
      : ''
  return {
    title: item.title ?? '',
    url,
    artist: item.artist,
    artwork,
    duration: typeof item.duration === 'number' ? item.duration : undefined,
    rating: typeof extras.rating === 'number' ? extras.rating : undefined,
    addedAt: typeof extras.addedAt === 'number' ? extras.addedAt : undefined,
    lyric_id: typeof extras.lyric_id === 'string' ? extras.lyric_id : undefined,
    playlist: Array.isArray(extras.playlist) ? extras.playlist.filter((value): value is string => typeof value === 'string') : undefined,
  }
}

type LegacyListener = (event: any) => void

const addEventListener = (event: Event, listener: LegacyListener) => {
  if (event === Event.PlaybackState) {
    const stateSubscription = TrackPlayerV5.addEventListener(V5Event.PlaybackStateChanged, ({ state }) => {
      listener({ state: state === 'ended' ? 'stopped' : state })
    })
    const playingSubscription = TrackPlayerV5.addEventListener(V5Event.IsPlayingChanged, ({ playing }) => {
      listener({ state: playing ? 'playing' : 'paused' })
    })
    return { remove: () => { stateSubscription.remove(); playingSubscription.remove() } }
  }

  if (event === Event.PlaybackActiveTrackChanged) {
    return TrackPlayerV5.addEventListener(V5Event.MediaItemTransition, ({ item, index }) => {
      listener({ track: fromMediaItem(item), index })
    })
  }

  return TrackPlayerV5.addEventListener(V5Event.PlaybackError, listener as any)
}

const TrackPlayer = {
  setupPlayer: (options?: SetupPlayerOptions) => TrackPlayerV5.setupPlayer({
    cache: options?.maxCacheSize ? { maxSizeBytes: options.maxCacheSize * 1024 * 1024 } : undefined,
    contentType: options?.contentType,
    audioMixing: options?.audioMixing,
  }),
  updateOptions: (options: { capabilities?: Capability[] }) => TrackPlayerV5.setCommands({
    capabilities: (options.capabilities ?? []).map((capability) => {
      switch (capability) {
        case Capability.Play:
        case Capability.Pause: return PlayerCommand.PlayPause
        case Capability.SkipToNext: return PlayerCommand.Next
        case Capability.SkipToPrevious: return PlayerCommand.Previous
      }
    }).filter(Boolean) as PlayerCommand[],
  }),
  registerPlaybackService: (service: () => void | Promise<void>) => TrackPlayerV5.registerPlaybackSession(service),
  registerRemoteHandlers: TrackPlayerV5.registerRemoteHandlers,
  addEventListener,
  play: TrackPlayerV5.play,
  pause: TrackPlayerV5.pause,
  skipToNext: TrackPlayerV5.skipToNext,
  skipToPrevious: TrackPlayerV5.skipToPrevious,
  seekTo: TrackPlayerV5.seekTo,
  setVolume: TrackPlayerV5.setVolume,
  getVolume: TrackPlayerV5.getVolume,
  getProgress: TrackPlayerV5.getProgress,
  isPlaying: TrackPlayerV5.isPlaying,
  setRepeatMode: (mode: RepeatMode) => TrackPlayerV5.setRepeatMode(mode as unknown as V5RepeatMode),
  getRepeatMode: () => {
    const mode = TrackPlayerV5.getRepeatMode()
    return mode === V5RepeatMode.One ? RepeatMode.Track : mode === V5RepeatMode.All ? RepeatMode.Queue : RepeatMode.Off
  },
  reset: TrackPlayerV5.clear,
  add: (track: Track | Track[]) => Array.isArray(track)
    ? TrackPlayerV5.addMediaItems(track.map(toMediaItem))
    : TrackPlayerV5.addMediaItem(toMediaItem(track)),
  setQueue: (tracks: Track[]) => TrackPlayerV5.setMediaItems(tracks.map(toMediaItem)),
  setShuffleEnabled: TrackPlayerV5.setShuffleEnabled,
  move: TrackPlayerV5.moveMediaItem,
  skip: TrackPlayerV5.skipToIndex,
  remove: TrackPlayerV5.removeMediaItem,
  getQueue: () => TrackPlayerV5.getQueue().map((item) => fromMediaItem(item)!).filter(Boolean),
  getActiveTrack: () => fromMediaItem(TrackPlayerV5.getActiveMediaItem()),
  getActiveTrackIndex: TrackPlayerV5.getActiveMediaItemIndex,
  getPlaybackState: () => ({
    state: TrackPlayerV5.getQueue().length === 0 ? 'none' : TrackPlayerV5.isPlaying() ? 'playing' : 'paused',
  }),
}

export const useActiveTrack = () => {
  const item = useActiveMediaItem()
  return useMemo(() => fromMediaItem(item), [item])
}
export const useIsPlaying = () => ({ playing: useIsPlayingV5() })
export const useProgress = (intervalMs?: number) => useProgressV5(intervalMs === undefined ? undefined : intervalMs / 1000)

export const useTrackPlayerEvents = (events: Event[], handler: (event: any) => void) => {
  useEffect(() => {
    const subscriptions = events.map((event) => addEventListener(event, (payload) => handler({ ...payload, type: event })))
    return () => subscriptions.forEach((subscription) => subscription.remove())
  }, [events, handler])
}

export const getPlaybackState = () => ({
  state: TrackPlayerV5.getQueue().length === 0 ? 'none' : TrackPlayerV5.isPlaying() ? 'playing' : 'paused',
})

export default TrackPlayer
