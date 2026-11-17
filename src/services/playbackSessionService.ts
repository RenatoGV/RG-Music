import { loadData } from "@/helpers/storage"
import TrackPlayer from "@/helpers/track-player-compat"
import { StoredPlayback } from "@/helpers/types"

export async function restorePlaybackSession() {
   const storedQueue = loadData<StoredPlayback | string>('playback_queue')
   const storedPosition = loadData<number>('playback_position')

   if (!storedQueue) return

   const playback = typeof storedQueue === 'string'
      ? (JSON.parse(storedQueue)) as StoredPlayback
      : storedQueue

   if (!playback.queue?.length) return

   const index = typeof playback.currentTrackIndex === 'number'
      ? playback.currentTrackIndex
      : 0

   const safeIndex = index >= 0 && index < playback.queue.length ? index : 0

   TrackPlayer.reset()
   TrackPlayer.add(playback.queue)
   TrackPlayer.skip(safeIndex)

   if (typeof storedPosition === 'number' && storedPosition > 0) {
      await new Promise(r => setTimeout(r, 300))
      TrackPlayer.seekTo(storedPosition)
   }
}