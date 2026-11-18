import AVFoundation
import ExpoModulesCore

public class MusicImportModule: Module {
  public func definition() -> ModuleDefinition {
    Name("MusicImport")

    AsyncFunction("getDuration") { (uri: String) async throws -> Double in
      guard let url = URL(string: uri) else {
        return 0
      }

      let asset = AVURLAsset(url: url)
      let duration = try await asset.load(.duration)
      let seconds = CMTimeGetSeconds(duration)
      return seconds.isFinite && seconds > 0 ? seconds : 0
    }
  }
}
