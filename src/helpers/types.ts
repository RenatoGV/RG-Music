import { Track as TrackPlayer } from "react-native-track-player";

export type Track = TrackPlayer & {
    lyric_id?: string
}

export type Playlist = {
    name: string
    tracksUri: string[]
    artworkPreview: string
}

export type Artist = {
    name: string
    tracks: Track[]
}