package expo.modules.musicimport

import android.media.MediaMetadataRetriever
import android.net.Uri
import android.content.Intent
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MusicImportModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("MusicImport")

    Function("start") {
      val context = requireNotNull(appContext.reactContext)
      context.startForegroundService(Intent(context, MusicImportService::class.java))
      Unit
    }

    Function("stop") {
      val context = requireNotNull(appContext.reactContext)
      context.stopService(Intent(context, MusicImportService::class.java))
      Unit
    }

    AsyncFunction("getDuration") { uri: String ->
      val context = requireNotNull(appContext.reactContext)
      val retriever = MediaMetadataRetriever()
      try {
        retriever.setDataSource(context, Uri.parse(uri))
        retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_DURATION)?.toDoubleOrNull()?.div(1000.0) ?: 0.0
      } finally {
        retriever.release()
      }
    }
  }
}
