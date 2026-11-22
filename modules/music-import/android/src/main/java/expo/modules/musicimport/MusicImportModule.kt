package expo.modules.musicimport

import android.media.MediaMetadataRetriever
import android.net.Uri
import android.content.Intent
import android.provider.DocumentsContract
import android.provider.OpenableColumns
import android.system.Os
import android.util.Log
import com.yausername.youtubedl_android.YoutubeDL
import com.yausername.youtubedl_android.YoutubeDLException
import com.yausername.youtubedl_android.YoutubeDLRequest
import org.json.JSONObject
import java.io.File
import java.io.FileInputStream
import java.util.UUID
import java.util.concurrent.atomic.AtomicReference
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class MusicImportModule : Module() {
  private class Download {
    val processId = UUID.randomUUID().toString()
    @Volatile var cancelled = false

    fun checkCancelled() {
      if (cancelled) throw InterruptedException("Descarga cancelada")
    }
  }

  private val activeDownload = AtomicReference<Download?>()
  private var initialized = false

  override fun definition() = ModuleDefinition {
    Name("MusicImport")
    Events("onAudioDownloadProgress")

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

    AsyncFunction("searchYouTubeMusic") { query: String ->
      ensureDownloaderInitialized()
      val request = YoutubeDLRequest("ytsearch12:${query.trim()}")
      request.addOption("--ignore-config")
      request.addOption("--flat-playlist")
      request.addOption("--dump-single-json")
      request.addOption("--skip-download")
      request.addOption("--quiet")
      request.addOption("--no-warnings")

      val output = YoutubeDL.getInstance().execute(request).out
      val root = JSONObject(output)
      val entries = root.optJSONArray("entries")
      (0 until (entries?.length() ?: 0)).mapNotNull { index ->
        val item = entries?.optJSONObject(index) ?: return@mapNotNull null
        val id = item.optString("id").takeIf { it.matches(Regex("[A-Za-z0-9_-]{11}")) } ?: return@mapNotNull null
        mapOf(
          "id" to id,
          "title" to item.optString("title", "Sin título"),
          "artist" to (item.optString("artist").ifBlank {
            item.optString("uploader").ifBlank { item.optString("channel", "Desconocido") }
          }),
          "album" to item.optString("album").takeIf { it.isNotBlank() },
          "duration" to item.optDouble("duration", 0.0),
          "artwork" to (item.optString("thumbnail").ifBlank {
            item.optJSONArray("thumbnails")?.optJSONObject(item.optJSONArray("thumbnails")!!.length() - 1)?.optString("url") ?: ""
          }),
          // Use YouTube's canonical watch URL. Flat YouTube Music results can
          // expose a music.youtube.com URL that is less reliable for extraction.
          "url" to "https://www.youtube.com/watch?v=$id"
        )
      }
    }

    AsyncFunction("downloadAudio") { videoUrl: String, folderUri: String, requestedName: String, quality: Int ->
      val context = requireNotNull(appContext.reactContext)
      val folder = Uri.parse(folderUri)
      require(DocumentsContract.isTreeUri(folder)) { "Selecciona de nuevo la carpeta de música." }
      require(quality in listOf(128, 192, 320)) { "Calidad de MP3 no válida." }
      val download = Download()
      check(activeDownload.compareAndSet(null, download)) { "Ya hay una descarga en curso." }
      val workDir = File(context.cacheDir, "music-download-${download.processId}")
      try {
        ensureDownloaderInitialized()
        download.checkCancelled()
        check(workDir.mkdirs()) { "No se pudo crear la carpeta temporal" }

        fun executeDownload(useProvider: Boolean) {
          download.checkCancelled()
          val request = YoutubeDLRequest(videoUrl)
          request.addOption("--ignore-config")
          request.addOption("--no-playlist")
          request.addOption("--no-js-runtimes") // The Android wrapper appends QuickJS.
          request.addOption("--cache-dir", File(context.cacheDir, "music-extractor").absolutePath)
          request.addOption("--socket-timeout", "20")
          request.addOption("--retries", "2")
          request.addOption("--fragment-retries", "2")
          request.addOption("--newline")
          request.addOption("--progress-delta", "0.25")
          if (useProvider) {
            request.addOption("--plugin-dirs", BgUtilsProvider.pluginDirectory(context).absolutePath)
            request.addOption("--extractor-args", "youtube:player_client=mweb")
          }
          request.addOption("--format", "bestaudio/best[acodec!=none]")
          request.addOption("-x")
          request.addOption("--audio-format", "mp3")
          request.addOption("--audio-quality", "${quality}K")
          request.addOption("--embed-metadata")
          request.addOption("--embed-thumbnail")
          request.addOption("--output", "${workDir.absolutePath}/audio.%(ext)s")

          val response = YoutubeDL.getInstance().execute(request, download.processId) { progress, _, line ->
            if (download.cancelled) {
              YoutubeDL.getInstance().destroyProcessById(download.processId)
            } else if (line.startsWith("[ExtractAudio]")) {
              reportProgress(1.0, "Convirtiendo a MP3…")
            } else if (progress in 0f..100f) {
              reportProgress(progress.toDouble() / 100.0)
            }
          }
          if (response.err.isNotBlank()) Log.w("RythmDownloader", response.err.takeLast(3000))
        }

        reportProgress(0.0, "Buscando el audio disponible…")
        try {
          executeDownload(useProvider = false)
        } catch (error: YoutubeDLException) {
          download.checkCancelled()
          val failure = error.message.orEmpty().lowercase()
          if ("postprocessing:" in failure || !providerMayHelp(failure)) throw error
          Log.w("RythmDownloader", "Falló la extracción inicial", error)
          reportProgress(0.0, "Probando otra conexión con YouTube…")
          BgUtilsProvider.prepare(context) { download.cancelled }
          download.checkCancelled()
          workDir.listFiles()?.forEach { it.deleteRecursively() }
          executeDownload(useProvider = true)
        }
        download.checkCancelled()
        val mp3 = File(workDir, "audio.mp3")
        check(mp3.isFile && mp3.length() > 0) { "yt-dlp terminó sin generar el MP3" }
        reportProgress(1.0, "Guardando el MP3…")
        copyToSafWithoutOverwrite(mp3, folder, requestedName, download)
      } catch (error: Exception) {
        download.checkCancelled()
        Log.e("RythmDownloader", "No se pudo completar el MP3", error)
        throw error
      } finally {
        workDir.deleteRecursively()
        BgUtilsProvider.stop()
        activeDownload.compareAndSet(download, null)
      }
    }

    Function("cancelAudioDownload") {
      activeDownload.get()?.let { download ->
        download.cancelled = true
        YoutubeDL.getInstance().destroyProcessById(download.processId)
      }
      Unit
    }
  }

  private fun reportProgress(progress: Double, message: String? = null) {
    sendEvent("onAudioDownloadProgress", mapOf("progress" to progress, "message" to message))
  }

  private fun providerMayHelp(failure: String): Boolean = listOf(
    "requested format is not available", "no video formats found", "only images are available",
    "http error 403", "po token", "page needs to be reloaded"
  ).any { it in failure }

  private fun ensureDownloaderInitialized() {
    synchronized(this) {
      if (initialized) return
      val context = requireNotNull(appContext.reactContext).applicationContext
      // Replace a cached older copy on upgrade. The wrapper invokes the zipapp
      // through its bundled Python and passes Android's libffmpeg.so explicitly.
      val directory = File(context.noBackupFilesDir, "${YoutubeDL.baseName}/${YoutubeDL.ytdlpDirName}")
      check(directory.isDirectory || directory.mkdirs()) { "No se pudo preparar el extractor." }
      val temporary = File.createTempFile("yt-dlp-", ".part", directory)
      try {
        context.assets.open("music-import/yt-dlp").use { input ->
          temporary.outputStream().use { output -> input.copyTo(output) }
        }
        Os.rename(temporary.absolutePath, File(directory, YoutubeDL.ytdlpBin).absolutePath)
      } finally {
        temporary.delete()
      }
      YoutubeDL.getInstance().init(context)
      val ffmpegClass = Class.forName("com.yausername.ffmpeg.FFmpeg")
      val ffmpeg = ffmpegClass.getMethod("getInstance").invoke(null)
      ffmpegClass.getMethod("init", android.content.Context::class.java).invoke(ffmpeg, context)
      initialized = true
    }
  }

  private fun copyToSafWithoutOverwrite(source: File, treeUri: Uri, requestedName: String, download: Download): Map<String, String> {
    val context = requireNotNull(appContext.reactContext)
    val resolver = context.contentResolver
    val treeId = DocumentsContract.getTreeDocumentId(treeUri)
    val childrenUri = DocumentsContract.buildChildDocumentsUriUsingTree(treeUri, treeId)
    val names = mutableSetOf<String>()
    resolver.query(childrenUri, arrayOf(DocumentsContract.Document.COLUMN_DISPLAY_NAME), null, null, null)?.use { cursor ->
      val nameIndex = cursor.getColumnIndex(DocumentsContract.Document.COLUMN_DISPLAY_NAME)
      while (cursor.moveToNext()) if (nameIndex >= 0) names.add(cursor.getString(nameIndex))
    }

    val cleaned = requestedName.trim().replace(Regex("(?i)\\.mp3$"), "")
      .replace(Regex("[\\\\/:*?\"<>|\\p{Cntrl}]"), "_").trimEnd('.', ' ').ifBlank { "Canción" }
    var candidate = "$cleaned.mp3"
    var suffix = 1
    val existingNames = names.map { it.lowercase() }.toSet()
    while (candidate.lowercase() in existingNames) candidate = "$cleaned (${suffix++}).mp3"

    val parentDocumentUri = DocumentsContract.buildDocumentUriUsingTree(treeUri, treeId)
    val documentUri = DocumentsContract.createDocument(resolver, parentDocumentUri, "audio/mpeg", candidate)
      ?: throw IllegalStateException("No se pudo crear el archivo en la carpeta seleccionada")
    try {
      resolver.openOutputStream(documentUri, "w")?.use { output ->
        FileInputStream(source).use { input ->
          val buffer = ByteArray(64 * 1024)
          while (true) {
            download.checkCancelled()
            val count = input.read(buffer)
            if (count == -1) break
            output.write(buffer, 0, count)
          }
        }
      } ?: throw IllegalStateException("No se pudo abrir el archivo de destino")
      download.checkCancelled()
      val actualName = runCatching { queryDisplayName(documentUri) }.getOrNull() ?: candidate
      return mapOf("uri" to documentUri.toString(), "fileName" to actualName)
    } catch (error: Exception) {
      runCatching { DocumentsContract.deleteDocument(resolver, documentUri) }
      throw error
    }
  }

  private fun queryDisplayName(uri: Uri): String? {
    val context = requireNotNull(appContext.reactContext)
    context.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { cursor ->
      val nameIndex = cursor.getColumnIndex(OpenableColumns.DISPLAY_NAME)
      if (cursor.moveToFirst() && nameIndex >= 0) return cursor.getString(nameIndex)
    }
    return null
  }
}
