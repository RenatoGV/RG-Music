import TrackPlayer from '@/helpers/track-player-compat'
import type { Track } from '@/helpers/types'

export const reorderQueueAfterCurrent = (
   nextTracks: Track[],
   queue = TrackPlayer.getQueue(),
   currentIndex = TrackPlayer.getActiveTrackIndex(),
) => {

   if (currentIndex == null || currentIndex < 0 || currentIndex >= queue.length) return false

   const currentTrack = queue[currentIndex]
   const remainingTracks = nextTracks.filter((track) => track.url !== currentTrack.url)

   TrackPlayer.setShuffleEnabled(false)

   // Keep the active media item in place. Remove the items around it in ranges,
   // then append the new order in one batch without reloading the current track.
   if (currentIndex < queue.length - 1) {
      TrackPlayer.removeRange(currentIndex + 1, queue.length)
   }

   if (currentIndex > 0) {
      TrackPlayer.removeRange(0, currentIndex)
   }

   if (remainingTracks.length > 0) {
      TrackPlayer.add(remainingTracks)
   }

   return true
}
