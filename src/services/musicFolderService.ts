import { importTracks } from "@/helpers/import"
import { loadData } from "@/helpers/storage"
import { pickDirectory } from "@react-native-documents/picker"
import { requireNativeModule } from "expo"
import { Platform } from "react-native"

let importInProgress = false

const runMusicImport = async (uri: string, mode: 'refresh' | 'replace') => {
   if (importInProgress) return

   importInProgress = true
   let stopService: (() => void) | undefined

   try {
      if (Platform.OS === 'android') {
         const musicImport = requireNativeModule<{
            start: () => void
            stop: () => void
         }>('MusicImport')

         musicImport.start()
         stopService = () => musicImport.stop()
      }

      await importTracks(uri, mode)
   } finally {
      try {
         stopService?.()
      } finally {
         importInProgress = false
      }
   }
}

export const selectMusicFolder = async () => {
   const { uri } = await pickDirectory({ requestLongTermAccess: true })

   if (uri) await runMusicImport(uri, 'replace')
}

export const refreshMusicFolder = async () => {
   const folderUri = loadData<string>('selectedAlbum')

   if (folderUri) await runMusicImport(folderUri, 'refresh')
}