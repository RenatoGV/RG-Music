import { scheduleAlarmNotification } from "@/helpers/notifications"
import { saveData } from "@/helpers/storage"
import TrackPlayer, { Event } from "@/helpers/track-player-compat"

export const playbackService = () => {
    TrackPlayer.registerRemoteHandlers({
        play: (command) => command.performDefault(),
        pause: (command) => command.performDefault(),
        next: (command) => command.performDefault(),
        previous: (command) => command.performDefault(),
    })

    TrackPlayer.addEventListener(Event.PlaybackError, async() => {
        const track = TrackPlayer.getActiveTrack()
        await scheduleAlarmNotification({title: 'Error al reproducir', message: `No se pudo reproducir ${track?.title}`})
        TrackPlayer.skipToNext()
    })

    TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
        if (state === 'paused' || state === 'stopped') {
            const position = (TrackPlayer.getProgress()).position
            saveData('playback_position', position)
        }
    })

    TrackPlayer.addEventListener(Event.PlaybackActiveTrackChanged, ({ track }) => {
        if(track == null) return

        const queue = TrackPlayer.getQueue()
        const index = TrackPlayer.getActiveTrackIndex()

        saveData(
            'playback_queue',
            JSON.stringify({
            queue,
            currentTrackIndex: index,
            })
        )

        const position = (TrackPlayer.getProgress()).position
        saveData('playback_position', position)
        
        console.log('💾 Queue + track index + position saved - BG')
    })
}
