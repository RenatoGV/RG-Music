import { unknownTrackImageUri } from '@/constants/images'
import { colors, screenPadding } from '@/constants/tokens'
import { defaultStyles } from '@/styles'
import { ActivityIndicator, Animated, Dimensions, PanResponder, Platform, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useActiveTrack } from '@/helpers/track-player-compat'
import { Track } from '@/helpers/types'
import { usePlayerBackground } from '@/hooks/usePlayerBackground'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurTargetView } from 'expo-blur'
import { useTrackPlayerFavorite } from '@/hooks/useTrackPlayerFavorite'
import { useEffect, useMemo, useRef, useState } from 'react'
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake'
import { useLyricStore } from '@/store/lyrics'
import { showToast } from '@/helpers/toast'
import { useLibraryStore } from '@/store/library'
import { router } from 'expo-router'
import { getArtistNames } from '@/helpers/groupTracksByArtist'
import EditLyricsIdModal from '@/components/modals/EditLyricIdModal'
import PlayerArtworkView from '@/screens/PlayerArtworkView'
import type { ComponentRef } from 'react'

type NativeViewRef = ComponentRef<typeof View>

const PlayerScreen = () => {
   const activeTrackRaw = useActiveTrack()
   const tracks = useLibraryStore(state => state.tracks)
   
   const activeTrack = activeTrackRaw && tracks
      ? tracks.find(t => t.url === activeTrackRaw.url) ?? (activeTrackRaw as Track)
      : (activeTrackRaw as Track | undefined)
   
   const { imageColors } = usePlayerBackground(activeTrack?.artwork ?? unknownTrackImageUri)
   const { showLyrics, setShowLyrics, syncedLyrics, setSyncedLyrics } = useLyricStore()
   const { updateTrackLyricId } = useLibraryStore()

   const { top, bottom } = useSafeAreaInsets()
   
   const { isFavorite, toggleFavorite } = useTrackPlayerFavorite()
   const dismissTranslation = useRef(new Animated.Value(0)).current
   const playerBlurTargetRef = useRef<NativeViewRef | null>(null)

   const [ modalVisible, setModalVisible ] = useState(false)

   const toggleLyrics = () => {
      setShowLyrics(!showLyrics)
   }

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
      <Animated.View style={[styles.screenDragContainer, { transform: [{ translateY: dismissTranslation }] }]}>
         <LinearGradient style={{flex: 1}} colors={imageColors ? [imageColors.average, imageColors.vibrant] : [colors.primary, colors.secondary, colors.background]}>
            <BlurTargetView ref={playerBlurTargetRef} style={styles.playerBlurTarget}>
               <View style={styles.overlayContainer}>
                  <DismissPlayerSymbol enabled={Platform.OS === 'android' && showLyrics} translateY={dismissTranslation} />

                  <View style={{flex: 1, marginTop: top + 40, marginBottom: bottom}}>
                     <PlayerArtworkView
                        track={activeTrack}
                        isFavorite={isFavorite}
                        onToggleFavorite={toggleFavorite}
                        onOpenLyrics={toggleLyrics}
                        onEditLyricId={() => setModalVisible(true)}
                        onArtistPress={handleArtistPress}
                        showLyrics={showLyrics}
                        syncedLyrics={syncedLyrics}
                        onToggleLyricsType={() => setSyncedLyrics(!syncedLyrics)}
                     />
                  </View>
               </View>
            </BlurTargetView>
         </LinearGradient>
         {modalVisible && (
            <EditLyricsIdModal
               key={activeTrack.url}
               initialValue={activeTrack.lyric_id ?? ''}
               onClose={() => setModalVisible(false)}
               onSave={handleSaveLyricId}
               blurTarget={playerBlurTargetRef}
            />
         )}
      </Animated.View>
   )
}

const DismissPlayerSymbol = ({ enabled, translateY }: { enabled: boolean; translateY: Animated.Value }) => {
   const {top} = useSafeAreaInsets()
   const panResponder = useMemo(() => PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => enabled && gestureState.dy > 8 && Math.abs(gestureState.dy) > Math.abs(gestureState.dx),
      onPanResponderGrant: () => translateY.setValue(0),
      onPanResponderMove: (_, gestureState) => translateY.setValue(Math.max(0, gestureState.dy)),
      onPanResponderTerminationRequest: () => false,
      onPanResponderRelease: (_, gestureState) => {
         if (gestureState.dy > 80 || gestureState.vy > 0.8) {
            Animated.timing(translateY, {
               toValue: Dimensions.get('window').height,
               duration: 220,
               useNativeDriver: true
            }).start(({ finished }) => {
               if (finished) router.back()
            })
            return
         }

         Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 3 }).start()
      },
      onPanResponderTerminate: () => {
         Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 20, bounciness: 3 }).start()
      }
   }), [enabled, translateY])

   return (
      <View style={{
         position: 'absolute',
         top,
         left: 0,
         right: 0,
         flexDirection: 'row',
         justifyContent: 'center',
         zIndex: 10
      }} pointerEvents="box-none">
         <View
            {...panResponder.panHandlers}
            accessible={false}
            style={{ width: 120, height: 44, alignItems: 'center', justifyContent: 'flex-start', paddingTop: 8 }}
         >
         <View accessible={false} style={{
            width: 75,
            height: 5,
            borderRadius: 8,
            backgroundColor: '#fff',
            opacity: 0.7
         }} />
         </View>
      </View>
   )
}

const styles = StyleSheet.create({
   screenDragContainer: { flex: 1 },
   playerBlurTarget: { flex: 1 },
   overlayContainer: {
      ...defaultStyles.container,
      paddingHorizontal: screenPadding.horizontal,
      backgroundColor: 'rgba(0,0,0,0.5)'
   }
})

export default PlayerScreen
