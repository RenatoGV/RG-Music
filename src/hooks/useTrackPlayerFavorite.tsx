import { showToast } from '@/helpers/toast'
import { useLibraryStore } from '@/store/library'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useActiveTrack } from '@/helpers/track-player-compat'

export const useTrackPlayerFavorite = () => {
    const activeTrack = useActiveTrack()
    const { tracks, toggleTrackFavorite } = useLibraryStore()

    const isFavoriteInStore = tracks?.find(t => t.url === activeTrack?.url)?.rating === 1
    
    const [ isFavorite, setIsFavorite ] = useState(false)

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
    const lastUrlRef = useRef<string | null>(null)

    useEffect(() => {
        if (!activeTrack?.url) return

        lastUrlRef.current = activeTrack.url
        setIsFavorite(isFavoriteInStore)
    }, [activeTrack?.url, isFavoriteInStore])

    const toggleFavorite = useCallback(() => {
        if (!activeTrack?.url) return

        const next = !isFavorite

        setIsFavorite(next)

        if (debounceRef.current) {
            clearTimeout(debounceRef.current)
        }

        debounceRef.current = setTimeout(() => {
            if (lastUrlRef.current !== activeTrack.url) return

            toggleTrackFavorite(activeTrack)

            showToast(next ? 'Agregado a Favoritos' : 'Eliminado de Favoritos')
        }, 400)
    }, [activeTrack, isFavorite, toggleTrackFavorite])

    return {
        isFavorite,
        toggleFavorite
    }
}
