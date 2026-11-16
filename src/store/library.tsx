import { Track } from "@/helpers/types";
import { create } from "zustand";
import { useMemo } from "react";
import { saveData } from "@/helpers/storage";
import { groupTracksByArtist } from "@/helpers/groupTracksByArtist";

interface LibraryState {
    tracks: Track[] | null
    isLoading: boolean
    progressLoading: number
    setIsLoading: (isLoading: boolean) => void
    setTracks: (tracks: Track[] | null) => void
    toggleTrackFavorite: (track: Track) => void
    addToPlaylist: (track: Track, playlistName: string) => void
    updateTrackLyricId: (trackUrl: string, lyricId: string) => void
    setProgressLoading: (progressLoading: number) => void
    resetProgressLoading: () => void
}

export const useLibraryStore = create<LibraryState>()((set, get) => ({
    tracks: null,
    isLoading: false,
    progressLoading: 0,
    setIsLoading: (isLoading) => set({isLoading: isLoading}),
    setTracks: (tracks) => set({tracks: tracks}),
	toggleTrackFavorite: (track) => {
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
    updateTrackLyricId: (trackUrl, lyricId) => set((state) => {
        const updatedTracks = state.tracks?.map((currentTrack) => {
            if(currentTrack.url === trackUrl){
                return {
                    ...currentTrack,
                    lyric_id: lyricId
                }
            }
            return currentTrack
        })
        saveData('tracks', updatedTracks)
        return {tracks: updatedTracks}
    }),
    setProgressLoading: (value) => set({progressLoading: value}),
    resetProgressLoading: () => {set({ progressLoading: 0 })}
}))

export const useTracks = () => useLibraryStore(state => state.tracks)

export const useArtists = () => {
    const tracks = useLibraryStore(state => state.tracks)

    return useMemo(() => groupTracksByArtist(tracks ?? []), [tracks])
}