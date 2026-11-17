import type { Artist, Track } from '@/helpers/types'

export function groupTracksByArtist(tracks: Track[]): Artist[] {
   const artists = new Map<string, Artist>()

   for (const track of tracks) {
      const names = getArtistNames(track.artist)

      const artistNames = names.length ? names : ['Desconocido']

      for (const name of artistNames) {
         const key = name.toLowerCase()

         const artist = artists.get(key)

         if(artist) artist.tracks.push(track)
         else artists.set(key, { name, tracks: [track] })
      }
   }

   return [...artists.values()]
}

export function getArtistNames(artist?: string): string[] {
   const names = (artist ?? '')
      .split(/[/,;]+/)
      .map((name) => name.trim())
      .filter(Boolean)

   return names.filter((name, index) => names.findIndex((other) => other.toLowerCase() === name.toLowerCase()) === index)
}