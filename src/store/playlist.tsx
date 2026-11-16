import { unknownTrackImageUri } from "@/constants/images"
import { saveData } from "@/helpers/storage"
import { Playlist } from "@/helpers/types"
import { randomUUID } from "expo-crypto"
import { create } from "zustand"

type PlaylistState = {
  playlists: Playlist[] | null
  setPlaylists: (playlists: Playlist[] | null) => void
  addPlaylist: (playlistName: string) => boolean
  removePlaylist: (playlistId: string) => void
  addToPlaylist: (trackUri: string, playlistId: string) => void
  removeToPlaylist: (trackUri: string, playlistId: string) => void
  addMultipleToPlaylist: (trackUris: string[], playlistId: string) => void
}

export const usePlaylistStore = create<PlaylistState>()((set, get) => ({
    playlists: null,
    setPlaylists: (playlists) => set({playlists: playlists}),
    addPlaylist: (playlistName) => {
      const name = playlistName.trim()
      const playlists = get().playlists ?? []

      const alreadyExists = playlists.some(
          (playlist) => playlist.name.trim().toLowerCase() === name.toLowerCase()
      )

      if (!name || alreadyExists) return false

      const updatedPlaylists = [
          ...playlists,
          { id: randomUUID(), name, tracksUri: [], artworkPreview: unknownTrackImageUri },
      ]

      saveData('playlists', updatedPlaylists)
      set({ playlists: updatedPlaylists })
      return true
    },
    removePlaylist: (playlistId) =>{
      set((state) => ({
        playlists: state.playlists?.filter((playlist) => playlist.id !== playlistId) ?? null
      }))
      
      saveData('playlists', get().playlists)
    },
    addToPlaylist: (uri, playlistId) => {
        set((state) => ({
            playlists: state.playlists
                ? state.playlists.map((currentPlaylist) =>
                    currentPlaylist.id === playlistId
                        ? {
                            ...currentPlaylist,
                            tracksUri: currentPlaylist.tracksUri.includes(uri)
                                ? currentPlaylist.tracksUri
                                : [...currentPlaylist.tracksUri, uri]
                        }
                        : currentPlaylist
                )
            : null
        }))
      
        saveData('playlists', get().playlists)
    },
    removeToPlaylist: (uri, playlistId) => {
        set((state) => ({
            playlists: state.playlists
              ? state.playlists.map((currentPlaylist) =>
                currentPlaylist.id === playlistId
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
    addMultipleToPlaylist: (trackList, playlistId) => {
      set((state) => ({
        playlists: state.playlists
          ? state.playlists.map((currentPlaylist) =>
              currentPlaylist.id === playlistId
                ? {
                    ...currentPlaylist,
                    tracksUri: [
                      ...currentPlaylist.tracksUri,
                      ...trackList.filter(
                        (track) =>
                          !currentPlaylist.tracksUri.includes(track)
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