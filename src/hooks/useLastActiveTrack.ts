import { useEffect, useState } from "react"
import { useActiveTrack } from "@/helpers/track-player-compat"
import { Track } from "@/helpers/types"

export const useLastActiveTrack = () => {
    const activeTrack = useActiveTrack()
    const [lastActiveTrack, setLastActiveTrack] = useState<Track>()

    useEffect(() => {
        if (!activeTrack) return

        setLastActiveTrack((previousTrack) => {
            if (
                previousTrack?.url === activeTrack.url &&
                previousTrack.title === activeTrack.title &&
                previousTrack.artist === activeTrack.artist &&
                previousTrack.artwork === activeTrack.artwork &&
                previousTrack.rating === activeTrack.rating &&
                previousTrack.lyric_id === activeTrack.lyric_id
            ) {
                return previousTrack
            }

            return activeTrack
        })
    }, [activeTrack])
    
    return activeTrack ?? lastActiveTrack
}
