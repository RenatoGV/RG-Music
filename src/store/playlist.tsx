import { unknownTrackImageUri } from "@/constants/images"
import { saveData } from "@/helpers/storage"
import { Playlist } from "@/helpers/types"
import { Track } from "react-native-track-player"
import { create } from "zustand"

type PlaylistState = {
    playlists: Playlist[] | null
    setPlaylists: (playlists: Playlist[] | null) => void
    addPlaylist: (playlistName: string) => void
    removePlaylist: (playlist: Playlist) => void
    addToPlaylist: (track: string, playlist: Playlist) => void
    removeToPlaylist: (track: string, playlist: Playlist) => void
    addMultipleToPlaylist: (track: string[], playlist: Playlist) => void
}

export const usePlaylistStore = create<PlaylistState>()((set, get) => ({
    playlists: null,
    setPlaylists: (playlists) => set({playlists: playlists}),
    addPlaylist: async(playlistName) =>{
      set((state) => {
        const newPlaylist : Playlist = {
          name: playlistName,
          tracksUri: [],
          artworkPreview: unknownTrackImageUri
        }

        return {
          playlists: state.playlists ? [...state.playlists, newPlaylist] : [newPlaylist]
        }
      })
      
      saveData('playlists', get().playlists)
    },
    removePlaylist: async(playlistToRemove) =>{
      set((state) => ({
        playlists: state.playlists!.filter((playlist) => playlist !== playlistToRemove)
      }))
      
      saveData('playlists', get().playlists)
    },
    addToPlaylist: async(uri, playlist) => {
        set((state) => ({
            playlists: state.playlists
                ? state.playlists.map((currentPlaylist) => 
                    currentPlaylist === playlist
                        ? {
                            ...currentPlaylist,
                            tracksUri: currentPlaylist.tracksUri.some((currentUri) => currentUri === uri)
                                ? currentPlaylist.tracksUri
                                : [...currentPlaylist.tracksUri, uri]
                        }
                        : currentPlaylist
                )
            : null
        }))
      
        saveData('playlists', get().playlists)
    },
    removeToPlaylist: async(uri, playlist) => {
        set((state) => ({
            playlists: state.playlists
              ? state.playlists.map((currentPlaylist) =>
                currentPlaylist === playlist
                    ? {
                        ...currentPlaylist,
                        tracksUri: currentPlaylist.tracksUri.filter((currentUri) => currentUri !== uri),
                      }
                    : currentPlaylist
                )
              : null,
          }))
      
          saveData('playlists', get().playlists)
    },
    addMultipleToPlaylist: (trackList, playlist) => {
      set((state) => ({
        playlists: state.playlists
          ? state.playlists.map((currentPlaylist) =>
              currentPlaylist === playlist
                ? {
                    ...currentPlaylist,
                    tracksUri: [
                      ...currentPlaylist.tracksUri,
                      ...trackList.filter(
                        (track) =>
                          !currentPlaylist.tracksUri.some(
                            (currentUri) => currentUri === track
                          )
                      ),
                    ],
                  }
                : currentPlaylist
            )
          : null,
      }))
      
      saveData('playlists', get().playlists)
    }
}))