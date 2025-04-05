import { Artist } from "@/helpers/types";
import { Track } from "react-native-track-player";
import { create } from "zustand";
import { useMemo } from "react";
import { saveData } from "@/helpers/storage";

interface LibraryState {
    tracks: Track[] | null
    isLoading: boolean
    progressLoading: number
    setIsLoading: (isLoading: boolean) => void
    setTracks: (tracks: Track[] | null) => void
    toggleTrackFavorite: (track: Track) => void
    addToPlaylist: (track: Track, playlistName: string) => void
    setProgressLoading: (progressLoading: number) => void
    resetProgressLoading: () => void
}

export const useLibraryStore = create<LibraryState>()((set, get) => ({
    tracks: null,
    isLoading: false,
    progressLoading: 0,
    setIsLoading: (isLoading) => set({isLoading: isLoading}),
    setTracks: (tracks) => set({tracks: tracks}),
	toggleTrackFavorite: async (track) => {
		set((state) => ({
			tracks: state.tracks?.map((currentTrack) => {
				if (currentTrack.url === track.url) {
					return {
						...currentTrack,
						rating: currentTrack.rating === 1 ? 0 : 1,
					}
				}

				return currentTrack
			}),
		}))
        saveData('tracks', get().tracks)
    },
    addToPlaylist: (track, playlistName) => set((state) => ({
        tracks: state.tracks?.map((currentTrack) => {
            if(currentTrack.url === track.url){
                return {
                    ...currentTrack,
                    playlist: [...(currentTrack.playlist ?? []), playlistName]
                }
            }

            return currentTrack
        })
    })),
    setProgressLoading: (value) => set({progressLoading: value}),
    resetProgressLoading: () => {set({ progressLoading: 0 })}
}))

export const useTracks = () => useLibraryStore(state => state.tracks)

export const useArtists = () => {
    const tracks = useLibraryStore(state => state.tracks)

    return useMemo(() => {
        return tracks?.reduce((acc, track) => {
            const artistField = track.artist || 'Desconocido'
            const artistNames = artistField.split(/[/,;]+/).map(name => name.trim()).filter(Boolean)

            artistNames.forEach(artistName => {
                const existingArtist = acc.find((artist: Artist) => artist.name.toLowerCase() === artistName.toLowerCase())

                if (existingArtist) {
                    existingArtist.tracks.push(track)
                } else {
                    acc.push({
                        name: artistName,
                        tracks: [track]
                    })
                }
            })
            return acc
        }, [] as Artist[])
    },[tracks]
    )
}