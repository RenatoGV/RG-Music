import { useCallback, useEffect, useState } from 'react'
import TrackPlayer from '@/helpers/track-player-compat'

export const useTrackPlayerVolume = () => {
    const [volume, setVolume] = useState<number | undefined>(undefined)

    const getVolume = useCallback(() => {
        const currentVolume = TrackPlayer.getVolume()
        setVolume(currentVolume)
    }, [])

    const updateVolume = useCallback((newVolume: number) => {
        if(newVolume < 0 || newVolume > 1) return

        setVolume(newVolume)

        TrackPlayer.setVolume(newVolume)
    }, [])

    useEffect(() => {
        getVolume()
    },[getVolume])

    return {
        volume,
        updateVolume
    }
}
