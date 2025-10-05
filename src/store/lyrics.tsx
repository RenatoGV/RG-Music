import { create } from "zustand"

type LyricStore = {
    showLyrics: boolean,
    setShowLyrics: (value: boolean) => void
}

export const useLyricStore = create<LyricStore>()((set) => ({
    showLyrics: false,
    setShowLyrics: (value) => set({showLyrics: value}),
}))