package expo.modules.musicimport

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
  }
}