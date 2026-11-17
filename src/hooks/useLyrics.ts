import { LyricsData, lyricsService } from "@/services/lyricsService"
import { isAxiosError } from "axios"
import { useEffect, useState } from "react"

interface UseLyricsParams {
   trackUrl: string
   track?: string
   artist?: string
   lyricId?: string
}

export function useLyrics({ trackUrl, track, artist, lyricId }: Readonly<UseLyricsParams>) {
   const [lyrics, setLyrics] = useState<LyricsData | null>(null)
   const [loading, setLoading] = useState(true)
   const [error, setError] = useState<string | null>(null)
   const [retryKey, setRetryKey] = useState(0)

   useEffect(() => {
      if (!track) return

      const controller = new AbortController()

      setLyrics(null)
      setError(null)
      setLoading(true)

      const fetchLyrics = async () => {
         try {
            const data = await lyricsService.getLyrics({ trackUrl, track, artist, lyricId, signal: controller.signal})

            if (controller.signal.aborted) return

            if (data) setLyrics(data)
            else setError('No se encontró la letra')
         } catch (error) {
            if (controller.signal.aborted) return

            if (isAxiosError(error) && error.code === 'ECONNABORTED') {
               setError('La conexión tardó demasiado')
            } else if (isAxiosError(error) && error.code === 'ERR_NETWORK') {
               setError('Error de red. Verifica tu conexión a internet')
            } else {
               setError('Error al cargar la letra')
            }
         } finally {
            if (!controller.signal.aborted) {
               setLoading(false)
            }
         }
      }

      void fetchLyrics()

      return () => controller.abort()
   }, [trackUrl, track, artist, lyricId, retryKey])

   const retry = () => setRetryKey((value) => value + 1)

   return { trackUrl, lyrics, loading, error, retry }
}