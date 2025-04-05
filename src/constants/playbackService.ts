import { scheduleAlarmNotification } from "@/helpers/notifications"
import TrackPlayer, { Event } from "react-native-track-player"

export const playbackService = async () => {
    TrackPlayer.addEventListener(Event.RemotePlay, () => {
        TrackPlayer.play()
    })

    TrackPlayer.addEventListener(Event.RemotePause, () => {
        TrackPlayer.pause()
    })

    TrackPlayer.addEventListener(Event.RemoteNext, () => {
        TrackPlayer.skipToNext()
    })

    TrackPlayer.addEventListener(Event.RemotePrevious, () => {
        TrackPlayer.skipToPrevious()
    })

    TrackPlayer.addEventListener(Event.PlaybackError, async() => {
        const track = await TrackPlayer.getActiveTrack()
        await scheduleAlarmNotification({title: 'Error al reproducir', message: `No se pudo reproducir ${track?.title}`})        
        await TrackPlayer.skipToNext()
    })
}