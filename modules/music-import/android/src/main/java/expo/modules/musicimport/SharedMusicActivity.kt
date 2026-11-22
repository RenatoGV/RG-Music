package expo.modules.musicimport

import android.app.Activity
import android.content.Intent
import android.os.Bundle

class SharedMusicActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    if (intent.action == Intent.ACTION_SEND && intent.type == "text/plain") {
      intent.getCharSequenceExtra(Intent.EXTRA_TEXT)?.toString()?.let { text ->
        packageManager.getLaunchIntentForPackage(packageName)?.let { launch ->
          launch.putExtra(SHARED_MUSIC_TEXT, text)
          startActivity(launch)
        }
      }
    }
    finish()
  }
}

internal const val SHARED_MUSIC_TEXT = "expo.modules.musicimport.SHARED_MUSIC_TEXT"
