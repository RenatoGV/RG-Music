import { FlatList, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import type { FlatListProps } from 'react-native'
import { utilsStyles } from '@/styles'
import TrackPlayer from '@/helpers/track-player-compat'
import { Track, Playlist } from '@/helpers/types'
import { useQueue } from '@/store/queue'
import { QueueControls } from '../other/QueueControls'
import { TrackListItem } from './TrackListItem'
import { shuffleTracks } from '@/helpers/shuffleTracks'
import { useTabContentBottomPadding } from '@/hooks/useTabContentBottomPadding'
import LottieView from 'lottie-react-native'
import notFound from '@/assets/lottie/not-found.json'
import { screenPadding } from '@/constants/tokens'
import type { ReactNode } from 'react'

export type TrackListProps = Partial<FlatListProps<Track>> & {
  id: string
  tracks: Track[]
  filteredTracks?: Track[]
  hideQueueControls?: boolean
  stickyQueueControls?: boolean
  stickyQueueControlsBackground?: ReactNode
  fromPlaylist?: Playlist
  onTrackPress?: (track: Track) => void
}

type QueueControlsRow = { __tracksListRow: 'queue-controls'; key: 'queue-controls' }
type EmptyTracksRow = { __tracksListRow: 'empty'; key: 'empty' }
type TracksListRow = Track | QueueControlsRow | EmptyTracksRow

const queueControlsRow: QueueControlsRow = { __tracksListRow: 'queue-controls', key: 'queue-controls' }
const emptyTracksRow: EmptyTracksRow = { __tracksListRow: 'empty', key: 'empty' }

const ItemDivider = () => <View style={{ marginVertical: 10, marginLeft: 60}} />

export const TracksList = ({ id, tracks, filteredTracks, hideQueueControls = false, stickyQueueControls = false, stickyQueueControlsBackground, fromPlaylist, onTrackPress, ListHeaderComponent, ...flatlistProps } : TrackListProps) => {
  const contentBottomPadding = useTabContentBottomPadding()
  const { height: windowHeight } = useWindowDimensions()
  const { activeQueueId, setActiveQueueId, shuffleEnabled, setShuffleOriginalQueue } = useQueue()

  const handleTrackSelect = (selectedTrack: Track) => {
    const trackIndex = tracks.findIndex(track => track.url === selectedTrack.url)

    if(trackIndex === -1) return

    onTrackPress?.(selectedTrack)

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

  const visibleTracks = filteredTracks ?? tracks
  const useStickyControls = stickyQueueControls && tracks.length > 0
  const listData: TracksListRow[] = useStickyControls
    ? [queueControlsRow, ...(visibleTracks.length > 0 ? visibleTracks : [emptyTracksRow])]
    : visibleTracks
  const listHeader = (!hideQueueControls && !stickyQueueControls && tracks.length > 0)
    ? <QueueControls queueId={id} tracks={tracks} style={{ paddingBottom: 20 }} />
    : ListHeaderComponent

  const renderEmptyContent = () => (
    <View style={[styles.emptyContent, useStickyControls && { minHeight: windowHeight * 0.55, justifyContent: 'flex-start' }]}>
      <Text style={utilsStyles.emptyContentText}>Sin resultados</Text>
      <LottieView
        source={notFound}
        style={{ width: '100%', height: useStickyControls ? Math.max(150, windowHeight * 0.25) : '25%' }}
        autoPlay
        loop
      />
    </View>
  )

  return (
    <FlatList<TracksListRow>
      data={listData}
      contentContainerStyle={{paddingTop: 10, paddingBottom: contentBottomPadding, flexGrow: 1}}
      ListHeaderComponent={listHeader}
      stickyHeaderIndices={useStickyControls ? [1] : undefined}
      ItemSeparatorComponent={ItemDivider}
      initialNumToRender={15}
      maxToRenderPerBatch={15}
      windowSize={5}
      removeClippedSubviews={true}
      ListEmptyComponent={renderEmptyContent}
      keyExtractor={(item) => '__tracksListRow' in item ? item.key : item.url}
      renderItem={({ item }) => {
        if ('__tracksListRow' in item) {
          if (item.__tracksListRow === 'queue-controls') {
            return (
              <View style={styles.stickyQueueControls}>
                {stickyQueueControlsBackground}
                <QueueControls queueId={id} tracks={tracks} />
              </View>
            )
          }

          return renderEmptyContent()
        }

        return (
          <View style={useStickyControls ? styles.stickyTrackItem : undefined}>
            <TrackListItem track={item} onTrackSelect={handleTrackSelect} fromPlaylist={fromPlaylist} />
          </View>
        )
      }}
      showsVerticalScrollIndicator={false}
      {...(flatlistProps as Partial<FlatListProps<TracksListRow>>)}
    />
  )
}

const styles = StyleSheet.create({
  emptyContent: {
    flex: 1,
    paddingHorizontal: screenPadding.horizontal,
    alignItems: 'center',
  },
  stickyQueueControls: {
    paddingHorizontal: screenPadding.horizontal,
    paddingTop: 12,
    paddingBottom: 12,
    overflow: 'hidden',
  },
  stickyTrackItem: {
    paddingHorizontal: screenPadding.horizontal,
  },
})
