import { useCallback, useEffect, useState } from "react"
import TrackPlayer, { RepeatMode } from "@/helpers/track-player-compat"

export const useTrackPlayerRepeatMode = () => {
    const [repeatMode, setRepeatMode] = useState<RepeatMode>()

    const changeRepeatMode = useCallback( async(repeatMode: RepeatMode) => {
        await TrackPlayer.setRepeatMode(repeatMode)

        setRepeatMode(repeatMode)
    }, [])

    useEffect(() => {
      TrackPlayer.getRepeatMode().then(setRepeatMode)
    }, [])
    
    return {
        repeatMode,
        changeRepeatMode
    }
}
