import { create } from "zustand"

type ModalStore = {
    modalVisible: boolean,
    setModalVisible: (value: boolean) => void
    modalFolderVisible: boolean,
    setModalFolderVisible: (value: boolean) => void
}

export const useModalStore = create<ModalStore>()((set) => ({
    modalVisible: false,
    setModalVisible: (value) => set({modalVisible: value}),
    modalFolderVisible: false,
    setModalFolderVisible: (value) => set({modalFolderVisible: value})
}))