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

export const filterPlaylistsByName = (playlists: Playlist[], search: string) => {
    const query = normalizeSearchText(search)
    if (!query) return playlists

    return playlists.filter((playlist) =>
        normalizeSearchText(playlist.name).includes(query)
    )
}

export const filterArtistsByName = (artists: Artist[], search: string) => {
    const query = normalizeSearchText(search)
    if(!query) return artists

    return artists.filter((artist) => normalizeSearchText(artist.name).includes(query))
}