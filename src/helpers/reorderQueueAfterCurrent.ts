import TrackPlayer from '@/helpers/track-player-compat'
import type { Track } from '@/helpers/types'

export const reorderQueueAfterCurrent = (
   nextTracks: Track[],
   queue = TrackPlayer.getQueue(),
   currentIndex = TrackPlayer.getActiveTrackIndex(),
) => {

   if (currentIndex == null || currentIndex < 0 || currentIndex >= queue.length) return false

   const currentTrack = queue[currentIndex]
   const currentPosition = TrackPlayer.getProgress().position
   const wasPlaying = TrackPlayer.isPlaying()
   const remainingTracks = nextTracks.filter((track) => track.url !== currentTrack.url)

   TrackPlayer.setShuffleEnabled(false)
   // Replace the queue in a single native command instead of issuing one move
   // or remove per track. Large libraries can otherwise flood the player queue.
   TrackPlayer.setQueue([currentTrack, ...remainingTracks])

   if (Number.isFinite(currentPosition) && currentPosition > 0) {
      TrackPlayer.seekTo(currentPosition)
   }

   if (wasPlaying) {
      TrackPlayer.play()
   }

   return true
}
