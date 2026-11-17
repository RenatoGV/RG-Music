import { loadData } from "@/helpers/storage"
import TrackPlayer from "@/helpers/track-player-compat"
import { StoredPlayback } from "@/helpers/types"

async function waitForActiveTrack(expectedIndex: number, expectedUrl: string) {
   const deadline = Date.now() + 2000

   while (Date.now() < deadline) {
      const activeTrack = TrackPlayer.getActiveTrack()
      const activeIndex = TrackPlayer.getActiveTrackIndex()

      if (activeIndex === expectedIndex && activeTrack?.url === expectedUrl) {
         return true
      }

      await new Promise((resolve) => setTimeout(resolve, 50))
   }

   return false
}

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
      const expectedTrack = playback.queue[safeIndex]
      const trackIsActive = await waitForActiveTrack(safeIndex, expectedTrack.url)

      if (!trackIsActive) {
         console.warn('No se pudo confirmar la pista antes de restaurar la posición')
         return
      }

      TrackPlayer.seekTo(storedPosition)
   }
}