import { Track } from '@/helpers/track-player-compat'

export type { Track }

export type Playlist = {
    name: string
    tracksUri: string[]
    artworkPreview: string
}

export type Artist = {
    name: string
    tracks: Track[]
}

export type StoredPlayback = {
    queue: Track[]
    currentTrackIndex: number
}
