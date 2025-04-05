import { create } from "zustand"

type QueueStore = {
    activeQueueId: string | null
    setActiveQueueId: (id: string | null) => void
}

export const useQueueStore = create<QueueStore>()((set) => ({
    activeQueueId: null,
    setActiveQueueId: (id) => set({activeQueueId: id})
}))

export const useQueue = () => useQueueStore((state) => state)
