import * as Notifications from "expo-notifications"
import { showToast } from "./toast"
import { Platform } from "react-native";

Notifications.setNotificationHandler({
   handleNotification: async () => ({
     shouldShowAlert: true,
     shouldPlaySound: true,
     shouldSetBadge: false,
   }),
})

export async function requestNotificationPermission(): Promise<void> {
   const { status } = await Notifications.requestPermissionsAsync();
   
   if (status !== 'granted') {
      showToast('Permiso de notificaciones denegado')
   }
}

export async function configureNotificationChannel() {
   if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.HIGH,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#fc3c44"
    });
  }
}

export async function scheduleAlarmNotification( options: { title: string; message: string; } ) {
   try {
      await requestNotificationPermission()

      const notificationId = await Notifications.scheduleNotificationAsync({
         content: {
            title: options.title,
            body: options.message
         },
         trigger: null
      })
   
      return notificationId
   } catch (error) {
      console.error(error)
      return undefined
   }
}