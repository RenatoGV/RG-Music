import { Artist, Playlist, Track } from "./types"

const normalizeSearchText = (text: string) =>
    text.toLowerCase()
        .normalize('NFD')
        .replaceAll('\u0301', '')
        .normalize('NFC')
        .trim()
        .replace(/\s+/g, ' ')

export const filterTrackByTitle = (tracks: Track[], search: string): Track[] => {
    const query = normalizeSearchText(search)

    if(!query) return tracks

    return tracks.filter((track) => normalizeSearchText(track.title).includes(query))
}

export const trackTitleFilter = (title: string) => (track: any) =>
    track.title?.toLowerCase().includes(title.toLowerCase())

export const artistNameFilter = (name: string) => (artist: Artist) =>
    artist.name.toLowerCase().includes(name.toLowerCase())

export const playlistsNameFilter = (name: string) => (playlist: Playlist) =>
    playlist.name.toLowerCase().includes(name.toLowerCase())