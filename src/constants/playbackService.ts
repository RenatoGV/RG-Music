import { scheduleAlarmNotification } from "@/helpers/notifications"
import { loadData, saveData } from "@/helpers/storage"
import TrackPlayer, { Event } from "react-native-track-player"

let lastSaved = 0

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

    TrackPlayer.addEventListener(Event.PlaybackState, async ({ state }) => {
        if (state === 'paused' || state === 'stopped') {
            const position = (await TrackPlayer.getProgress()).position
            saveData('playback_position', position)
        }
    })

    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, async({ track }) => {
        if(track == null) return

        const queue = await TrackPlayer.getQueue()
        const index = await TrackPlayer.getActiveTrackIndex()

        saveData(
            'playback_queue',
            JSON.stringify({
            queue,
            currentTrackIndex: index,
            })
        )

        const position = (await TrackPlayer.getProgress()).position
        saveData('playback_position', position)
        
        console.log('💾 Queue + track index + position saved - BG')
    })
}