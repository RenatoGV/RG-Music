import type { Track } from '@/helpers/types'


export function shuffleTracks(tracks: Track[]): Track[] {
   const shuffled = [...tracks]

   for (let index = shuffled.length - 1; index > 0; index--) {
      const randomIndex = Math.floor(Math.random() * (index + 1))
      const track = shuffled[index]

      shuffled[index] = shuffled[randomIndex]
      shuffled[randomIndex] = track
   }

   return shuffled
}