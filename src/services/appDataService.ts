import { loadData, saveData } from "@/helpers/storage";
import { Playlist, Track } from "@/helpers/types";
import { randomUUID } from "expo-crypto";

type StoredPlaylist = Omit<Playlist, 'id'> & { id?: string }

export function loadPersistedAppData() {
   const tracks = loadData<Track[]>('tracks')
   const storedPlaylists = loadData<StoredPlaylist[]>('playlists')

   const playlists = storedPlaylists?.map((playlist) => ({
      ...playlist,
      id: playlist.id || randomUUID()
   })) ?? null

   if(playlists && storedPlaylists?.some((playlist) => !playlist.id)) {
      saveData('playlists', playlists)
   }

   return { tracks, playlists }
}