import { create } from "zustand"

type LyricStore = {
    showLyrics: boolean,
    setShowLyrics: (value: boolean) => void,
    syncedLyrics: boolean,
    setSyncedLyrics: (value:boolean) => void
}

export const useLyricStore = create<LyricStore>()((set) => ({
    showLyrics: false,
    setShowLyrics: (value) => set({showLyrics: value}),
    syncedLyrics: true,
    setSyncedLyrics: (value) => set({syncedLyrics: value})
}))