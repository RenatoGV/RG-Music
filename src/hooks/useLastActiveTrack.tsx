import { useEffect, useState } from "react"
import { useActiveTrack } from "react-native-track-player"
import { Track } from "@/helpers/types"

export const useLastActiveTrack = () => {
    const activeTrack = useActiveTrack()
    const [lastActiveTrack, setLastActiveTrack] = useState<Track>()

    // Almacenar última canción reproducida
    useEffect(() => {
        if(!activeTrack) return

      setLastActiveTrack(activeTrack)
    }, [activeTrack])
    
    return lastActiveTrack
}