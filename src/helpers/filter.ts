import { Artist, Playlist } from "./types"

export const trackTitleFilter = (title: string) => (track: any) =>
    track.title?.toLowerCase().includes(title.toLowerCase())

export const artistNameFilter = (name: string) => (artist: Artist) =>
    artist.name.toLowerCase().includes(name.toLowerCase())

export const playlistsNameFilter = (name: string) => (playlist: Playlist) =>
    playlist.name.toLowerCase().includes(name.toLowerCase())