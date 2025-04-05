import { ToastAndroid } from "react-native"

export const showToast = (title : any) => {
    ToastAndroid.show(title, ToastAndroid.SHORT)
}