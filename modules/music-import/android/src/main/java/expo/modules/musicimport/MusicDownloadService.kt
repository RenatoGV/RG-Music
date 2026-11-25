package expo.modules.musicimport

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.IBinder

class MusicDownloadService : Service() {
  override fun onBind(intent: Intent?): IBinder? = null

  override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
    val channel = "music_download_progress"
    getSystemService(NotificationManager::class.java).createNotificationChannel(
      NotificationChannel(channel, "Descargas de música", NotificationManager.IMPORTANCE_LOW)
    )
    startForeground(4202, Notification.Builder(this, channel)
      .setSmallIcon(android.R.drawable.stat_sys_download)
      .setContentTitle(intent?.getStringExtra("title") ?: "Descargando música…")
      .setContentIntent(packageManager.getLaunchIntentForPackage(packageName)?.let { launch ->
        PendingIntent.getActivity(this, 4202, launch, PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT)
      })
      .setProgress(0, 0, true)
      .setOngoing(true)
      .build())
    return START_NOT_STICKY
  }

  override fun onTimeout(startId: Int, fgsType: Int) = stopSelf()
}
