import { FlatList, FlatListProps, Text, View } from 'react-native'
import { utilsStyles } from '@/styles'
import TrackPlayer from '@/helpers/track-player-compat'
import { Track, Playlist } from '@/helpers/types'
import FastImage from 'react-native-fast-image'
import { unknownTrackImageUri } from '@/constants/images'
import { useQueue } from '@/store/queue'
import { QueueControls } from '../other/QueueControls'
import { TrackListItem } from './TrackListItem'
import { shuffleTracks } from '@/helpers/shuffleTracks'
import { useTabContentBottomPadding } from '@/hooks/useTabContentBottomPadding'

export type TrackListProps = Partial<FlatListProps<Track>> & {
  id: string
  tracks: Track[]
  filteredTracks?: Track[]
  hideQueueControls?: boolean
  fromPlaylist?: Playlist
}

const ItemDivider = () => <View style={{...utilsStyles.itemSeparator, marginVertical: 9, marginLeft: 60}} />

export const TracksList = ({ id, tracks, filteredTracks, hideQueueControls = false, fromPlaylist, ...flatlistProps } : TrackListProps) => {
  const contentBottomPadding = useTabContentBottomPadding()
  const { activeQueueId, setActiveQueueId, shuffleEnabled, setShuffleOriginalQueue } = useQueue()

  const handleTrackSelect = (selectedTrack: Track) => {
    const trackIndex = tracks.findIndex(track => track.url === selectedTrack.url)

    if(trackIndex === -1) return

    if (shuffleEnabled) {
      const remainingTracks = tracks.filter((_, index) => index !== trackIndex)
      setShuffleOriginalQueue([selectedTrack, ...remainingTracks].map((track) => track.url))

      TrackPlayer.setShuffleEnabled(false)
      TrackPlayer.setQueue([
          selectedTrack,
          ...shuffleTracks(remainingTracks),
        ])

      setActiveQueueId(id)
      TrackPlayer.play()

      return
    }

    if (id === activeQueueId) {
      const queueIndex = TrackPlayer.getQueue().findIndex(
          (track) => track.url === selectedTrack.url
      )

      if (queueIndex >= 0) {
          TrackPlayer.skip(queueIndex)
          TrackPlayer.play()
          return
      }
    }

    setShuffleOriginalQueue(null)
    TrackPlayer.setShuffleEnabled(false)
    TrackPlayer.setQueue(tracks)
    TrackPlayer.skip(trackIndex)

    setActiveQueueId(id)
    TrackPlayer.play()
  }

  return (
    <FlatList
      data={filteredTracks}
      contentContainerStyle={{paddingTop: 10, paddingBottom: contentBottomPadding}}
      ListHeaderComponent={
        (!hideQueueControls && tracks.length > 0) ? <QueueControls queueId={id} tracks={tracks} style={{paddingBottom: 20}}/> : undefined
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
            source={{ uri: unknownTrackImageUri }}
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
