import { saveData } from "@/helpers/storage";
import TrackPlayer, { getPlaybackState } from "@/helpers/track-player-compat";
import { useEffect } from "react";

export function usePersistPlaybackPosition(enabled: boolean) {
   useEffect(() => {
      if(!enabled) return

      const interval = setInterval(() => {
         try {
            if (getPlaybackState().state !== 'playing') return

            const position = TrackPlayer.getProgress().position
            saveData('playback_position', position)
         } catch (error) {
            console.error('Error saving playback position', error)
         }
      }, 5000)

      return () => clearInterval(interval)
   }, [enabled])
}