import { unknownTrackImageUri } from '@/constants/images'
import { colors, screenPadding } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { ActivityIndicator, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useActiveTrack } from '@/helpers/track-player-compat'
import { Track } from '@/helpers/types'
import { usePlayerBackground } from '@/hooks/usePlayerBackground'
import { LinearGradient } from 'expo-linear-gradient'
import { useTrackPlayerFavorite } from '@/hooks/useTrackPlayerFavorite'
import { useEffect, useState } from 'react'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { useLyricStore } from '@/store/lyrics'
import { showToast } from '@/helpers/toast'
import { useLibraryStore } from '@/store/library'
import { router } from 'expo-router'
import { getArtistNames } from '@/helpers/groupTracksByArtist'
import EditLyricsIdModal from '@/components/modals/EditLyricIdModal'
import PlayerLyricsView from '@/screens/PlayerLyricsView'
import PlayerArtworkView from '@/screens/PlayerArtworkView'

const PlayerScreen = () => {
   const activeTrackRaw = useActiveTrack()
   const tracks = useLibraryStore(state => state.tracks)
   
   const activeTrack = activeTrackRaw && tracks
      ? tracks.find(t => t.url === activeTrackRaw.url) ?? (activeTrackRaw as Track)
      : (activeTrackRaw as Track | undefined)
   
   const { imageColors } = usePlayerBackground(activeTrack?.artwork ?? unknownTrackImageUri)
   const { showLyrics, setShowLyrics } = useLyricStore()
   const { updateTrackLyricId } = useLibraryStore()

   const { top, bottom } = useSafeAreaInsets()
   
   const { isFavorite, toggleFavorite } = useTrackPlayerFavorite()

   const [ modalVisible, setModalVisible ] = useState(false)

   useEffect(() => {
      if(showLyrics){
         void activateKeepAwakeAsync('rg-music')
      }else{
         void deactivateKeepAwake('rg-music')
      }
   }, [showLyrics])

   const handleArtistPress = () => {
      const names = getArtistNames(activeTrack?.artist)

      if(names.length !== 1) {
         router.navigate('/(tabs)/artists')
         return
      }

      router.navigate({
         pathname: '/(tabs)/artists/[name]',
         params: { name: names[0] }
      })
   }

   const handleSaveLyricId = (lyricId: string) => {
      if(!activeTrack) return

      updateTrackLyricId(activeTrack.url, lyricId)
      showToast('Lyric Id establecido')
      setModalVisible(false)
   }

   if(!activeTrack) {
      return (
         <View style={[defaultStyles.container, {justifyContent: 'center'}]}>
               <ActivityIndicator color={colors.icon} />
         </View>
      )
   }

   return (
      <LinearGradient style={{flex: 1}} colors={imageColors ? [imageColors.average, imageColors.vibrant] : [colors.primary, colors.secondary, colors.background]}>
         {
               modalVisible && (
                  <EditLyricsIdModal
                     key={activeTrack.url}
                     initialValue={activeTrack.lyric_id ?? ''}
                     onClose={() => setModalVisible(false)}
                     onSave={handleSaveLyricId}
                  />
               )
         }
         <View style={styles.overlayContainer}>
               {(showLyrics) ? <></> : <DismissPlayerSymbol />}

               <View style={{flex: 1, marginTop: (showLyrics) ? top : top + 70, marginBottom: bottom}}>
                  {
                     (showLyrics)
                     ?
                           <PlayerLyricsView
                              track={activeTrack}
                              onArtistPress={handleArtistPress}
                           />
                     :   <PlayerArtworkView
                              track={activeTrack}
                              isFavorite={isFavorite}
                              onToggleFavorite={toggleFavorite}
                              onOpenLyrics={() => setShowLyrics(true)}
                              onEditLyricId={() => setModalVisible(true)}
                              onArtistPress={handleArtistPress}
                           />
                  }
               </View>
         </View>
      </LinearGradient>
   )
}

const DismissPlayerSymbol = () => {
   const {top} = useSafeAreaInsets()

   return (
      <View style={{
         position: 'absolute',
         top: top + 8,
         left: 0,
         right: 0,
         flexDirection: 'row',
         justifyContent: 'center'
      }}>
         <View accessible={false} style={{
               width: 50,
               height: 8,
               borderRadius: 8,
               backgroundColor: '#fff',
               opacity: 0.7
         }} />
      </View>
   )
}

const styles = StyleSheet.create({
   overlayContainer: {
      ...defaultStyles.container,
      paddingHorizontal: screenPadding.horizontal,
      backgroundColor: 'rgba(0,0,0,0.5)'
   }
})

export default PlayerScreen
