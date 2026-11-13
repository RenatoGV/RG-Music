import { useCallback, useEffect, useState } from "react"
import TrackPlayer, { RepeatMode } from "@/helpers/track-player-compat"

export const useTrackPlayerRepeatMode = () => {
    const [repeatMode, setRepeatMode] = useState<RepeatMode>()

    const changeRepeatMode = useCallback( (repeatMode: RepeatMode) => {
        TrackPlayer.setRepeatMode(repeatMode)

        setRepeatMode(repeatMode)
    }, [])

    useEffect(() => {
        setRepeatMode(TrackPlayer.getRepeatMode())
    }, [])
    
    return {
        repeatMode,
        changeRepeatMode
    }
}
