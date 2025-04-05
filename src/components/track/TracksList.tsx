import { FlatList, FlatListProps, Text, View } from 'react-native'
import { utilsStyles } from '@/styles'
import TrackPlayer, { Track } from 'react-native-track-player'
import FastImage from 'react-native-fast-image'
import { unknownTrackImageUri } from '@/constants/images'
import { useQueue } from '@/store/queue'
import { useRef } from 'react'
import { Playlist } from '@/helpers/types'
import { QueueControls } from '../other/QueueControls'
import { TrackListItem } from './TrackListItem'

export type TrackListProps = Partial<FlatListProps<Track>> & {
  id: string
  tracks: Track[]
  hideQueueControls?: boolean
  fromPlaylist?: Playlist
}

const ItemDivider = () => <View style={{...utilsStyles.itemSeparator, marginVertical: 9, marginLeft: 60}} />

export const TracksList = ({ id, tracks, hideQueueControls = false, fromPlaylist, ...flatlistProps } : TrackListProps) => {
  // TODO: Entender el Código de QUEUE
  const queueOffset = useRef(0)
  const {activeQueueId, setActiveQueueId} = useQueue()

  const handleTrackSelect = async(selectedTrack: Track) => {
    const trackIndex = tracks.findIndex(track => track.url === selectedTrack.url)

    if(trackIndex === -1) return

    const isChangingQueue = id !== activeQueueId

    if(isChangingQueue) {
      // Al cambiar de canción en otra Pantalla, obtendremos las canciones que seguian o estaban previa a su posición en la lista
      const beforeTracks = tracks.slice(0, trackIndex)
      const afterTracks = tracks.slice(trackIndex + 1)

      // Reiniciaremos el reproductor
      await TrackPlayer.reset()

      // Agregaremos la canción a reproducir
      await TrackPlayer.add(selectedTrack)
      // Agregaremos a la lista las canciones que le seguían según la lista
      await TrackPlayer.add(afterTracks)
      // Y agregaremos a la lista las canciones que le estaban previas según la lista para que se reproduzca la lista entera
      await TrackPlayer.add(beforeTracks)

      // Reproducimos la nueva lista
      await TrackPlayer.play()

      queueOffset.current = trackIndex
      setActiveQueueId(id)
    } else {
      const nextTrackIndex = trackIndex - queueOffset.current < 0
        ? tracks.length + trackIndex - queueOffset.current
        : trackIndex - queueOffset.current
      
        await TrackPlayer.skip(nextTrackIndex)

        await TrackPlayer.play()
    }
  }

  return (
    <FlatList 
        data={tracks}
        contentContainerStyle={{paddingTop: 10, paddingBottom: 128}}
        ListHeaderComponent={
          !hideQueueControls ? <QueueControls tracks={tracks} style={{paddingBottom: 20}}/>
            : undefined
        }
        ItemSeparatorComponent={ItemDivider}
        initialNumToRender={15}
        maxToRenderPerBatch={15}
        windowSize={5}
        removeClippedSubviews={true}
        ListEmptyComponent={
          <View>
            <Text style={utilsStyles.emptyContentText}>No se encontraron canciones</Text>
            <FastImage
              source={{ uri: unknownTrackImageUri, priority: FastImage.priority.normal }}
              style={utilsStyles.emptyContentImage}
            />
          </View>
        }
        renderItem={({item : track}) => (
            <TrackListItem track={track} onTrackSelect={handleTrackSelect} fromPlaylist={fromPlaylist} />
        )}
        showsVerticalScrollIndicator={false}
        {...flatlistProps}
    />
  )
}