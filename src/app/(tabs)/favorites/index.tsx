import { defaultStyles } from '@/styles'
import { View } from 'react-native'
import { ScrollView } from 'react-native-gesture-handler'
import { screenPadding } from '@/constants/tokens'
import { useMemo } from 'react'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { trackTitleFilter } from '@/helpers/filter'
import { generateTrackListId } from '@/helpers/miscellaneous'
import { useLibraryStore } from '@/store/library'
import { TracksList } from '@/components/track/TracksList'

const FavoriteScreen = () => {
  const search = useNavigationSearch({
    searchBarOptions: {
      placeholder: 'Buscar en Favoritos'
    }
  })

  const { tracks } = useLibraryStore()

  const favoritesTracks = tracks?.filter((track) => track.rating === 1)
  
  const filteredFavoritesTracks = useMemo(() => {
    if(!favoritesTracks) return []
    
    favoritesTracks.sort((a, b) => a.title!.localeCompare(b.title!))

    if(!search) return favoritesTracks

    return favoritesTracks.filter(trackTitleFilter(search))
  }, [search, favoritesTracks])

  return (
    <View style={defaultStyles.container}>
      <ScrollView
        style={{paddingHorizontal: screenPadding.horizontal}}
        contentInsetAdjustmentBehavior='automatic'
      >
        <TracksList id={generateTrackListId('favorites', search)} scrollEnabled={false} tracks={filteredFavoritesTracks} />
      </ScrollView>
    </View>
  )
}

export default FavoriteScreen