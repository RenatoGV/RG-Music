import TrackPlayer from '@/helpers/track-player-compat'
import type { Track } from '@/helpers/types'

export const reorderQueueAfterCurrent = (nextTracks: Track[]) => {
   const queue = TrackPlayer.getQueue()
   const currentIndex = TrackPlayer.getActiveTrackIndex()

   if (currentIndex == null || currentIndex < 0 || currentIndex >= queue.length) return false

   TrackPlayer.setShuffleEnabled(false)

   for (let index = 0; index < currentIndex; index++) {
      TrackPlayer.move(0, queue.length - 1)
      queue.push(queue.shift()!)
   }

   const nextUrls = new Set(nextTracks.map((track) => track.url))
   for (let index = queue.length - 1; index >= 1; index--) {
      if (!nextUrls.has(queue[index].url)) {
         TrackPlayer.remove(index)
         queue.splice(index, 1)
      }
   }

   nextTracks.forEach((track, index) => {
      const targetIndex = index + 1
      let fromIndex = queue.findIndex(
         (item, position) => position >= targetIndex && item.url === track.url,
      )

      if (fromIndex === -1) {
         TrackPlayer.add(track)
         queue.push(track)
         fromIndex = queue.length - 1
      }

      if (fromIndex !== targetIndex) {
         TrackPlayer.move(fromIndex, targetIndex)
         const [movedTrack] = queue.splice(fromIndex, 1)
         queue.splice(targetIndex, 0, movedTrack)
      }
   })

   return true
}
