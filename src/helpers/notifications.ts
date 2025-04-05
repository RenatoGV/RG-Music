import * as Notifications from "expo-notifications"
import { showToast } from "./toast"

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