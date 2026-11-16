import { create } from "zustand"

type QueueStore = {
    activeQueueId: string | null
    setActiveQueueId: (id: string | null) => void
    shuffleEnabled: boolean
    setShuffleEnabled: (enabled: boolean) => void
}

export const useQueueStore = create<QueueStore>()((set) => ({
    activeQueueId: null,
    setActiveQueueId: (id) => set({activeQueueId: id}),
    shuffleEnabled: false,
    setShuffleEnabled: (enabled) => set({ shuffleEnabled: enabled })
}))

export const useQueue = () => useQueueStore((state) => state)
