package expo.modules.musicimport

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder

class MusicImportService : Service() {
  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val channelId = "music_import_progress"
    val manager = getSystemService(NotificationManager::class.java)
    manager.createNotificationChannel(
      NotificationChannel(channelId, "Importación de música", NotificationManager.IMPORTANCE_LOW)
    )

    val notification = Notification.Builder(this, channelId)
      .setSmallIcon(android.R.drawable.stat_sys_download)
      .setContentTitle("Importando canciones…")
      .setProgress(0, 0, true)
      .setOngoing(true)
      .build()

    startForeground(4201, notification)
    return START_NOT_STICKY
  }

  override fun onTimeout(startId: Int, fgsType: Int) {
    stopSelf()
  }
}