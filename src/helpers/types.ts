import { Track } from "react-native-track-player";

export type Playlist = {
    name: string
    tracksUri: string[]
    artworkPreview: string
}

export type Artist = {
    name: string
    tracks: Track[]
}