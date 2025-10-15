import { showToast } from '@/helpers/toast'
import { useLibraryStore } from '@/store/library'
import { useCallback } from 'react'
import TrackPlayer, { useActiveTrack } from 'react-native-track-player'

export const useTrackPlayerFavorite = () => {
    const activeTrack = useActiveTrack()

    const { tracks, toggleTrackFavorite } = useLibraryStore()

    const favorites = tracks?.filter((track) => track.rating === 1)

    const isFavorite = favorites?.find((track) => track.url === activeTrack?.url)?.rating === 1

    const toggleFavorite = useCallback(async() => {
        const id = await TrackPlayer.getActiveTrackIndex()

        if(id == null) return

        await TrackPlayer.updateMetadataForTrack(id, {
            rating: isFavorite ? 0 : 1
        })

        if(activeTrack) {
            toggleTrackFavorite(activeTrack)
        }

        showToast((isFavorite) ? 'Eliminado de Favoritos' : 'Agregado a Favoritos')
    }, [isFavorite, toggleTrackFavorite, activeTrack])

    return {
        isFavorite,
        toggleFavorite
    }
}