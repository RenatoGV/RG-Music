import { FlatList, FlatListProps, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { utilsStyles } from '@/styles'
import TrackPlayer, { Track } from 'react-native-track-player'
import FastImage from 'react-native-fast-image'
import { unknownTrackImageUri } from '@/constants/images'
import { SelectTrackListItem } from './SelectTrackListItem'
import { useEffect, useState } from 'react'
import { colors, fontSize } from '@/constants/tokens'
import { showToast } from '@/helpers/toast'
import { useRouter } from 'expo-router'
import { usePlaylistStore } from '@/store/playlist'
import { Playlist } from '@/helpers/types'

export type Props = Partial<FlatListProps<Track>> & {
  tracks: Track[]
  playlist: Playlist | undefined
}

const ItemDivider = () => <View style={{...utilsStyles.itemSeparator, marginVertical: 9, marginLeft: 60}} />

export const SelectTrackList = ({ tracks, playlist, ...flatlistProps } : Props) => {
   const router = useRouter()

   const [selectedTracks, setSelectedTracks] = useState<string[]>([])
   const { addMultipleToPlaylist } = usePlaylistStore()

   const handleTrackSelect = async(selectedTrack: string) => {
      if(!selectedTracks.some((track) => selectedTrack === track)) {
         setSelectedTracks([...selectedTracks, selectedTrack])
      } else {
         const updatedSelectedTracks = selectedTracks.filter((track) => track !== selectedTrack)
         setSelectedTracks(updatedSelectedTracks)
      }
   }

   const handleAddToPlaylist = () => {
      if(playlist){
         addMultipleToPlaylist(selectedTracks, playlist)
         showToast(`${selectedTracks.length} canciones agregadas`)
      }
      router.dismiss()
   }

  return (
    <FlatList 
        data={tracks}
        ItemSeparatorComponent={ItemDivider}
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={5}
        removeClippedSubviews={true}
        stickyHeaderIndices={[0]}
        ListHeaderComponent={
            <View style={styles.headerContainer}>
               <Text style={styles.headerText}>Seleccionado: {selectedTracks.length}</Text>
               <TouchableOpacity style={styles.button} onPress={handleAddToPlaylist}>
                  <Text style={styles.buttonText}>Agregar</Text>
               </TouchableOpacity>
            </View>
        }
        ListEmptyComponent={
          <View>
            <Text style={utilsStyles.emptyContentText}>No se encontraron canciones</Text>
            <FastImage
              source={{ uri: unknownTrackImageUri, priority: FastImage.priority.normal }}
              style={utilsStyles.emptyContentImage}
            />
          </View>
        }
        ListFooterComponent={<View style={{height: 20}}/>}
        renderItem={({item : track}) => (
            <SelectTrackListItem track={track} onTrackSelect={handleTrackSelect} selectedTracks={selectedTracks} />
        )}
        showsVerticalScrollIndicator={false}
        {...flatlistProps}
    />
  )
}

const styles = StyleSheet.create({
   headerContainer: {
      backgroundColor: colors.background,
      paddingVertical: 15,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center'
   },
   headerText: {
      color: colors.text,
      fontSize: fontSize.sm
   },
   button: {
      backgroundColor: colors.primary,
      paddingVertical: 10,
      paddingHorizontal: 30,
      borderRadius: 50
   },
   buttonText: {
      color: colors.text
   }
})