import { unknownTrackImageUri } from "@/constants/images"
import { Album, getAssetsAsync } from "expo-media-library"
import { showToast } from "./toast"
import { useLibraryStore } from "@/store/library"
import { saveData } from "./storage"
import { getAudioMetadata } from "@missingcore/audio-metadata"
import { AppState } from "react-native"
import { scheduleAlarmNotification } from "./notifications"
// import { pickDirectory } from "@react-native-documents/picker"
// @react-native-documents/viewer
// import { StorageAccessFramework } from "expo-file-system"

export const importTracks = async (album: Album | null) => {
    const {
      setTracks,
      setIsLoading,
      setProgressLoading,
      resetProgressLoading
    } = useLibraryStore.getState();

    resetProgressLoading()
  
    try {
      if (album !== null) {
        setIsLoading(true);
        
        // const { uri } = await pickDirectory({
        //   requestLongTermAccess: false,
        // })

        // const files = await StorageAccessFramework.readDirectoryAsync(uri)
        // const audioExtensions = ['.mp3', '.wav', '.aac', '.m4a']
        // const audioFiles = files.filter(fileName => {
        //   const lower = fileName.toLowerCase();
        //   return audioExtensions.some(ext => lower.endsWith(ext));
        // })

        const assets = await getAssetsAsync({
          album: album,
          mediaType: 'audio',
          sortBy: 'creationTime',
          first: album.assetCount
        })
  
        const totalAssets = assets.assets.length
        let currentProgress = 0
        const tracks = []
  
        for (const track of assets.assets) {

          const safeUri = encodeURI(track.uri).replace(/#/g, '%23')

          try {
            currentProgress += 1 / totalAssets
            setProgressLoading(currentProgress)
            
            const tags = ['artist', 'artwork'] as const
            const { metadata } = await getAudioMetadata(safeUri, tags)

            tracks.push({
              title: track.filename.replace('.mp3', ''),
              url: safeUri,
              artist: metadata.artist || 'Desconocido',
              artwork: metadata.artwork || unknownTrackImageUri
            })

          } catch (error) {
            console.log('Error procesando track:', track.filename, error)
            
            tracks.push({
              title: track.filename.replace('.mp3', ''),
              url: safeUri,
              artist: 'Desconocido',
              artwork: unknownTrackImageUri,
            })
          }
        }
  
        setTracks(tracks)
        saveData('tracks', tracks)
        saveData('selectedAlbum', album)

        if(AppState.currentState === 'active'){
          showToast(`${tracks.length} canciones cargadas`)
        } else {
          await scheduleAlarmNotification({title: 'Caniones importadas', message: `${tracks.length} canciones cargadas`})  
        }

        setIsLoading(false)
      }
    } catch (error) {
      console.error('Error loading selectedAlbum', error)
    }
  };