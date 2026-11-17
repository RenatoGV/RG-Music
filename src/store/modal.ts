import { create } from "zustand"

type ModalStore = {
    modalVisible: boolean,
    setModalVisible: (value: boolean) => void
}

export const useModalStore = create<ModalStore>()((set) => ({
    modalVisible: false,
    setModalVisible: (value) => set({modalVisible: value})
}))