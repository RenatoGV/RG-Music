import { importTracks } from "@/helpers/import"
import { loadData } from "@/helpers/storage"
import { pickDirectory } from "@react-native-documents/picker"

export const selectMusicFolder = async () => {
   const { uri } = await pickDirectory({ requestLongTermAccess: true })

   if(uri) await importTracks(uri, 'replace')
}

export const refreshMusicFolder = async () => {
   const folderUri = loadData<string>('selectedAlbum')

   if(folderUri) await importTracks(folderUri, 'refresh')
}