import { defaultStyles } from '@/styles'
import { View } from 'react-native'
import { screenPadding } from '@/constants/tokens'
import { useMemo } from 'react'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { generateTrackListId } from '@/helpers/miscellaneous'
import { useTracks } from '@/store/library'
import { TracksList } from '@/components/track/TracksList'
import { filterTrackByTitle } from '@/helpers/filter'

const FavoritesScreen = () => {
   const search = useNavigationSearch({
      searchBarOptions: {
         placeholder: 'Buscar en Favoritos',
         shouldShowHintSearchIcon: false
      }
   })

   const tracks = useTracks()

   const favoritesTracks = useMemo(() => {
      const favorites = (tracks ?? []).filter((track) => track.rating === 1)
      return favorites.sort((a, b) => a.title.localeCompare(b.title))
   }, [tracks])
   
   const filteredFavoritesTracks = filterTrackByTitle(favoritesTracks, search)

   return (
      <View style={[defaultStyles.container, { paddingHorizontal: screenPadding.horizontal}]}>
         <TracksList
            id={generateTrackListId('favorites', search)}
            tracks={favoritesTracks}
            filteredTracks={filteredFavoritesTracks}
         />
      </View>
   )
}

export default FavoritesScreen