import { create } from "zustand"

type QueueStore = {
    activeQueueId: string | null
    setActiveQueueId: (id: string | null) => void
    shuffleEnabled: boolean
    setShuffleEnabled: (enabled: boolean) => void
    shuffleOriginalQueue: string[] | null
    setShuffleOriginalQueue: (trackUrls: string[] | null) => void
}

export const useQueueStore = create<QueueStore>()((set) => ({
    activeQueueId: null,
    setActiveQueueId: (id) => set({activeQueueId: id}),
    shuffleEnabled: false,
    setShuffleEnabled: (enabled) => set({ shuffleEnabled: enabled }),
    shuffleOriginalQueue: null,
    setShuffleOriginalQueue: (trackUrls) => set({ shuffleOriginalQueue: trackUrls })
}))

export const useQueue = () => useQueueStore((state) => state)
