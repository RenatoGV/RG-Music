import { defaultStyles } from '@/styles'
import { StyleSheet, View } from 'react-native'
import { useMemo, useState } from 'react'
import { generateTrackListId } from '@/helpers/miscellaneous'
import { useTracks } from '@/store/library'
import { TracksList } from '@/components/track/TracksList'
import { filterTrackByTitle } from '@/helpers/filter'
import { LinearGradient } from 'expo-linear-gradient'
import { ScreenHeader } from '@/components/common/ScreenHeader'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { screenPadding } from '@/constants/tokens'
import { QueueControls } from '@/components/other/QueueControls'

const FavoritesScreen = () => {
   const insets = useSafeAreaInsets()
   const [search, setSearch] = useState('')
	const songsQueueId = generateTrackListId('favorites', search)

   const tracks = useTracks()

	const sortedTracks = useMemo(
		() => (tracks ?? [])
			.filter((track) => track.rating === 1)
			.sort((a, b) => a.title.localeCompare(b.title)),
		[tracks]
	)

   const filteredTracks = filterTrackByTitle(sortedTracks, search)

   return (
      <View style={defaultStyles.container}>
			<ScreenGradient />
         <ScreenHeader
            title="Favoritos"
            searchValue={search}
            onSearchChange={setSearch}
            searchPlaceholder="Buscar en Favoritos"
            topInset={insets.top}
         />
         <View style={styles.content}>
			{sortedTracks.length > 0 && (
               <QueueControls
                  queueId={songsQueueId}
					tracks={sortedTracks}
                  style={styles.queueControls}
               />
            )}
            <TracksList
               id={songsQueueId}
				   tracks={sortedTracks}
               filteredTracks={filteredTracks}
               hideQueueControls
               style={styles.trackList}
            />
         </View>
      </View>
   )
}

const ScreenGradient = () => (
   <LinearGradient
      pointerEvents="none"
      colors={['#18553A', '#02181C', '#0E0E10']}
      locations={[0, 0.21, 1]}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
      style={StyleSheet.absoluteFill}
   />
)

const styles = StyleSheet.create({
   content: {
      flex: 1,
      paddingHorizontal: screenPadding.horizontal,
   },
   queueControls: {
      paddingBottom: 20,
   },
	trackList: {
		flex: 1,
	}
})

export default FavoritesScreen
