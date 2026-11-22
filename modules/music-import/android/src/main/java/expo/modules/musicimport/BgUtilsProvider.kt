package expo.modules.musicimport

import android.content.Context
import android.system.Os
import java.io.File
import java.io.FileInputStream
import java.net.HttpURLConnection
import java.net.URL
import java.util.zip.ZipInputStream

/** Local PO-token provider used by yt-dlp. Nothing is proxied through our servers. */
internal object BgUtilsProvider {
  private const val VERSION = "2.0.2"
  private const val PORT = 4416
  private var server: Process? = null

  @Synchronized
  fun prepare(context: Context, isCancelled: () -> Boolean = { false }) {
    check(!isCancelled()) { "Descarga cancelada" }
    val app = context.applicationContext
    val nativeLibraryDir = File(app.applicationInfo.nativeLibraryDir)
    val deno = File(nativeLibraryDir, "libdeno.so")
    check(deno.isFile && File(nativeLibraryDir, "libdeno.zip.so").isFile) {
      "El runtime Deno no está incluido en este build. Reinstala el development build de Android."
    }
    val denoLibDir = extractDenoRuntime(app, nativeLibraryDir)

    val providerDir = File(app.filesDir, "bgutils-pot-$VERSION")
    val serverDir = File(providerDir, "server")
    val pluginDir = File(providerDir, "plugins")
    val plugin = File(pluginDir, "bgutil-ytdlp-pot-provider.zip")
    val marker = File(providerDir, ".ready")
    if (!marker.isFile || !plugin.isFile || !File(serverDir, "src/main.ts").isFile) {
      server?.destroyForcibly()
      providerDir.deleteRecursively()
      check(providerDir.mkdirs()) { "No se pudo crear el directorio del proveedor local" }
      downloadAndExtract(
        "https://github.com/Brainicism/bgutil-ytdlp-pot-provider/archive/refs/tags/$VERSION.zip",
        File(providerDir, "source.zip"),
        providerDir,
        isCancelled
      )
      File(providerDir, "source.zip").delete()
      check(serverDir.isDirectory) { "El paquete BGUtils no contiene el servidor esperado" }
      installDenoDependencies(app, deno, denoLibDir, nativeLibraryDir, serverDir, isCancelled)
      check(pluginDir.mkdirs()) { "No se pudo crear el directorio de plugins yt-dlp" }
      download(
        "https://github.com/Brainicism/bgutil-ytdlp-pot-provider/releases/download/$VERSION/bgutil-ytdlp-pot-provider.zip",
        plugin,
        isCancelled
      )
      File(providerDir, ".ready.tmp").writeText(VERSION)
      check(File(providerDir, ".ready.tmp").renameTo(marker)) { "No se pudo preparar BGUtils" }
    }

    ensureServer(app, deno, denoLibDir, nativeLibraryDir, serverDir, isCancelled)
  }

  fun pluginDirectory(context: Context): File =
    File(context.applicationContext.filesDir, "bgutils-pot-$VERSION/plugins")

  @Synchronized
  fun stop() {
    server?.let {
      runCatching { it.destroy() }
      if (it.isAlive) runCatching { it.destroyForcibly() }
    }
    server = null
  }

  private fun installDenoDependencies(
    context: Context,
    deno: File,
    denoLibDir: File,
    nativeLibraryDir: File,
    serverDir: File,
    isCancelled: () -> Boolean
  ) {
    val logFile = File(context.cacheDir, "bgutils-install.log")
    val process = ProcessBuilder(
      deno.absolutePath, "install", "--allow-scripts=npm:canvas", "--frozen"
    ).directory(serverDir)
      .redirectErrorStream(true)
      .redirectOutput(logFile)
      .apply {
        environment()["HOME"] = context.filesDir.absolutePath
        environment()["DENO_DIR"] = File(context.filesDir, "deno-cache").absolutePath
        environment()["TMPDIR"] = context.cacheDir.absolutePath
        environment()["LD_LIBRARY_PATH"] = "${denoLibDir.absolutePath}:${nativeLibraryDir.absolutePath}"
      }
      .start()
    val deadline = System.currentTimeMillis() + java.util.concurrent.TimeUnit.MINUTES.toMillis(4)
    while (process.isAlive && System.currentTimeMillis() < deadline) {
      if (isCancelled()) {
        process.destroyForcibly()
        throw InterruptedException("Descarga cancelada")
      }
      Thread.sleep(250)
    }
    if (process.isAlive) {
      process.destroyForcibly()
      throw IllegalStateException("La preparación de dependencias BGUtils superó 4 minutos")
    }
    if (process.exitValue() != 0) {
      val details = runCatching { logFile.readText().takeLast(1800) }.getOrDefault("")
      throw IllegalStateException("No se pudieron preparar las dependencias BGUtils: $details")
    }
  }

  private fun ensureServer(
    context: Context,
    deno: File,
    denoLibDir: File,
    nativeLibraryDir: File,
    serverDir: File,
    isCancelled: () -> Boolean
  ) {
    if (isHealthy()) return
    server?.let { runCatching { it.destroyForcibly() } }
    val logFile = File(context.cacheDir, "bgutils-provider.log")
    val process = ProcessBuilder(
      deno.absolutePath,
      "run", "-A", "src/main.ts", "--host", "127.0.0.1", "--port", PORT.toString()
    ).directory(serverDir)
      .redirectErrorStream(true)
      .redirectOutput(logFile)
      .apply {
        environment()["HOME"] = context.filesDir.absolutePath
        environment()["DENO_DIR"] = File(context.filesDir, "deno-cache").absolutePath
        environment()["TMPDIR"] = context.cacheDir.absolutePath
        environment()["LD_LIBRARY_PATH"] = "${denoLibDir.absolutePath}:${nativeLibraryDir.absolutePath}"
      }
      .start()
    server = process

    val deadline = System.currentTimeMillis() + 90_000
    while (System.currentTimeMillis() < deadline) {
      if (isCancelled()) {
        process.destroyForcibly()
        server = null
        throw InterruptedException("Descarga cancelada")
      }
      if (!process.isAlive) {
        val details = runCatching { logFile.readText().takeLast(1800) }.getOrDefault("")
        throw IllegalStateException("No se pudo iniciar BGUtils local: $details")
      }
      if (isHealthy()) return
      Thread.sleep(300)
    }
    process.destroyForcibly()
    server = null
    val details = runCatching { logFile.readText().takeLast(1800) }.getOrDefault("")
    throw IllegalStateException("BGUtils no respondió en el teléfono. $details")
  }

  private fun isHealthy(): Boolean = try {
    val connection = URL("http://127.0.0.1:$PORT/ping").openConnection() as HttpURLConnection
    connection.connectTimeout = 700
    connection.readTimeout = 700
    connection.useCaches = false
    try { connection.responseCode == 200 } finally { connection.disconnect() }
  } catch (_: Exception) {
    false
  }

  private fun extractDenoRuntime(context: Context, nativeLibraryDir: File): File {
    val runtimeRoot = File(context.filesDir, "deno-runtime-2.7.7")
    val libraryDir = File(runtimeRoot, "usr/lib")
    val ready = File(runtimeRoot, ".ready")
    if (ready.exists() && libraryDir.isDirectory && File(libraryDir, "libsqlite3.so").isFile) {
      return libraryDir
    }

    runtimeRoot.deleteRecursively()
    check(runtimeRoot.mkdirs()) { "No se pudo crear la carpeta del runtime Deno" }
    val archive = File(nativeLibraryDir, "libdeno.zip.so")
    val pendingLinks = mutableListOf<Pair<File, String>>()
    ZipInputStream(FileInputStream(archive).buffered()).use { zip ->
      while (true) {
        val entry = zip.nextEntry ?: break
        val output = File(runtimeRoot, entry.name).canonicalFile
        check(output.path.startsWith(runtimeRoot.canonicalPath + File.separator)) {
          "Ruta inválida dentro del runtime Deno"
        }
        if (entry.isDirectory) {
          output.mkdirs()
        } else {
          output.parentFile?.mkdirs()
          output.outputStream().buffered().use { target ->
            val buffer = ByteArray(8192)
            while (true) {
              val count = zip.read(buffer)
              if (count < 0) break
              target.write(buffer, 0, count)
            }
          }
          if (output.parentFile?.canonicalPath == libraryDir.canonicalPath && output.length() <= 256) {
            output.readText().trim().takeIf { it.matches(Regex("lib[\\w.+-]+\\.so(?:\\.\\d+)*")) }
              ?.let { pendingLinks.add(output to it) }
          }
        }
        zip.closeEntry()
      }
    }

    pendingLinks.forEach { (link, targetName) ->
      val target = File(libraryDir, targetName)
      check(target.isFile) { "Falta $targetName, requerido por Deno" }
      link.delete()
      Os.symlink(target.name, link.absolutePath)
    }
    check(File(libraryDir, "libsqlite3.so").isFile) { "El runtime Deno no incluye SQLite" }
    ready.writeText("2.7.7")
    return libraryDir
  }

  private fun downloadAndExtract(url: String, archive: File, destination: File, isCancelled: () -> Boolean) {
    download(url, archive, isCancelled)
    ZipInputStream(archive.inputStream().buffered()).use { zip ->
      while (true) {
        if (isCancelled()) throw InterruptedException("Descarga cancelada")
        val entry = zip.nextEntry ?: break
        val relative = entry.name.substringAfter('/', "")
        if (relative.isNotBlank()) {
          val output = File(destination, relative).canonicalFile
          check(output.path.startsWith(destination.canonicalPath + File.separator)) {
            "Ruta inválida en el paquete BGUtils"
          }
          if (entry.isDirectory) output.mkdirs() else {
            output.parentFile?.mkdirs()
            output.outputStream().buffered().use { zip.copyTo(it) }
          }
        }
        zip.closeEntry()
      }
    }
  }

  private fun download(url: String, destination: File, isCancelled: () -> Boolean) {
    destination.parentFile?.mkdirs()
    val temporary = File(destination.parentFile, destination.name + ".part")
    val connection = URL(url).openConnection() as HttpURLConnection
    connection.connectTimeout = 20_000
    connection.readTimeout = 60_000
    connection.instanceFollowRedirects = true
    try {
      connection.connect()
      check(connection.responseCode in 200..299) {
        "Descarga de componentes BGUtils falló: HTTP ${connection.responseCode}"
      }
      connection.inputStream.use { input ->
        temporary.outputStream().buffered().use { output ->
          val buffer = ByteArray(8192)
          while (true) {
            if (isCancelled()) throw InterruptedException("Descarga cancelada")
            val count = input.read(buffer)
            if (count == -1) break
            output.write(buffer, 0, count)
          }
        }
      }
      check(temporary.length() > 0) { "GitHub devolvió un componente vacío para BGUtils" }
      check(temporary.renameTo(destination)) { "No se pudo guardar un componente de BGUtils" }
    } catch (error: Exception) {
      temporary.delete()
      throw error
    } finally {
      connection.disconnect()
    }
  }
}
