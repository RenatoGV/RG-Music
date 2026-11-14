import { createLyricsAxiosInstance } from "@/helpers/networkRequest"
import { loadData, removeData, saveData } from "@/helpers/storage"
import { isAxiosError } from "axios"

const LRCLIB_API = 'https://lrclib.net/api/get'

export type LyricsData = {
   plainLyrics: string | null
   syncedLyrics: string | null
}

type GetLyricsParams = {
   trackUrl: string
   track: string
   artist?: string
   lyricId?: string
   signal?: AbortSignal
}

type CachedLyrics = {
   lyricId: string | null
   lyrics: LyricsData
}

type SearchVariant = {
   artist: string
   track: string
}

class LyricsService {
   async getLyrics(params: GetLyricsParams): Promise<LyricsData | null> {
      const { trackUrl, signal } = params
      const lyricId = params.lyricId?.trim() || null

      if(signal?.aborted) return null

      const cacheKey = this.getCacheKey(trackUrl)
      const cached = loadData<CachedLyrics>(cacheKey)

      if (cached?.lyricId === lyricId && (cached.lyrics?.plainLyrics || cached.lyrics?.syncedLyrics)) {
         return cached.lyrics
      }

      const lyrics = await this.fetchFromLrclib({...params, lyricId: lyricId ?? undefined})

      if (signal?.aborted) return null

      if(lyrics) {
         const entry: CachedLyrics = { lyricId, lyrics }

         try {
            saveData(cacheKey, entry)
         } catch(error) {
            console.warn('No se pudo guardar la letra en caché', error)
         }
      }

      return lyrics
   }

   removeCachedLyrics(trackUrl: string): boolean {
      return removeData(this.getCacheKey(trackUrl))
   }

   private getCacheKey(trackUrl: string): string {
      return `lyrics:v2:${trackUrl}`
   }

   async fetchFromLrclib({ track, artist, lyricId, signal }: GetLyricsParams): Promise<LyricsData | null> {
      const axiosClient = createLyricsAxiosInstance()

      if (lyricId) {
         const lyrics = await this.fetchLyrics(
            axiosClient,
            `${LRCLIB_API}/${encodeURIComponent(lyricId)}`,
            signal
         )

         if(lyrics) return lyrics
      }

      for(const variant of this.getVariants(track, artist)) {
         const artistName = encodeURIComponent(variant.artist)
         const trackName = encodeURIComponent(variant.track)
         const url = `${LRCLIB_API}?artist_name=${artistName}&track_name=${trackName}`

         const lyrics = await this.fetchLyrics(axiosClient, url, signal)

         if(lyrics) return lyrics
      }

      return null
   }

   private async fetchLyrics(client: ReturnType<typeof createLyricsAxiosInstance>, url: string, signal?: AbortSignal): Promise<LyricsData | null> {
      try {
         const { data } = await client.get<Partial<LyricsData> | null>(url, { signal })

         if(!data?.plainLyrics && !data?.syncedLyrics) return null

         return {
            plainLyrics: data.plainLyrics ?? null,
            syncedLyrics: data.syncedLyrics ?? null
         }
      } catch (error) {
         if(isAxiosError(error) && error.response?.status === 404) return null

         throw error
      }
   }

   private readonly getVariants = (track: string, artist?: string): SearchVariant[] => {
      const trackName = track.trim()
      const artistName = artist?.trim() ?? ''

      if (!trackName) return []

      const variants: SearchVariant[] = [
         { artist: artistName, track: trackName }
      ]

      const parts = trackName.split('-')
      if (parts.length === 2) {
         const [first, second] = parts.map(p => p.trim())

         variants.push(
            { artist: first, track: second },
            { artist: second, track: first }
         )
      }

      if(artistName.includes('/')) {
         for (const name of artistName.split('/')) {
            variants.push({ artist: name.trim(), track: trackName })
         }
      }

      return variants
   }
}

export const lyricsService = new LyricsService()