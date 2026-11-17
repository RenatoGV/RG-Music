import { MovingText } from '@/components/other/MovingText'
import { PlayerArtwork } from '@/components/player/PlayerArtwork'
import { PlayerControls } from '@/components/player/PlayerControls'
import { PlayerProgressbar } from '@/components/player/PlayerProgressbar'
import { PlayerVolumenbar } from '@/components/player/PlayerVolumenbar'
import { colors, fontSize } from '@/constants/tokens'
import { unknownTrackImageUri } from '@/constants/images'
import type { Track } from '@/helpers/types'
import { defaultStyles } from '@/styles'
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'
import { LayoutChangeEvent, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import PlayerLyricsView from '@/screens/PlayerLyricsView'
import Animated, { Easing, FadeIn, FadeOut, LinearTransition, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated'
import { scheduleOnRN } from 'react-native-worklets'
import { useEffect, useRef, useState } from 'react'

interface PlayerArtworkViewProps {
   track: Track
   isFavorite: boolean
   onToggleFavorite: () => void
   onOpenLyrics: () => void
   onEditLyricId: () => void
   onArtistPress: () => void
   showLyrics: boolean
   syncedLyrics: boolean
   onToggleLyricsType: () => void
}

const layoutTransition = LinearTransition.duration(650).easing(Easing.inOut(Easing.cubic))
const transitionDelayMs = 200
const transitionDurationMs = 650

const PlayerArtworkView = ({ track, isFavorite, onToggleFavorite, onOpenLyrics, onEditLyricId, onArtistPress, showLyrics, syncedLyrics, onToggleLyricsType }: Readonly<PlayerArtworkViewProps>) => {
   const [layoutSize, setLayoutSize] = useState({ width: 0, height: 0 })
   const [transitionComplete, setTransitionComplete] = useState(showLyrics)
   const [headerCompact, setHeaderCompact] = useState(showLyrics)
   const previousShowLyrics = useRef(showLyrics)
   const artworkProgress = useSharedValue(showLyrics ? 1 : 0)
   const infoProgress = useSharedValue(showLyrics ? 1 : 0)
   const playbackControlsHeight = useSharedValue(showLyrics ? 30 : 40)

   useEffect(() => {
      playbackControlsHeight.value = withTiming(showLyrics ? 30 : 40, {
         duration: transitionDurationMs,
         easing: Easing.inOut(Easing.cubic)
      })
   }, [showLyrics, playbackControlsHeight])

   useEffect(() => {
      if (previousShowLyrics.current === showLyrics) return
      previousShowLyrics.current = showLyrics
      setTransitionComplete(false)

      if (showLyrics) {
         const headerDelay = setTimeout(() => {
            setHeaderCompact(true)
         }, transitionDelayMs)
         artworkProgress.value = withTiming(1, {
            duration: transitionDurationMs,
            easing: Easing.inOut(Easing.cubic)
         })
         infoProgress.value = withDelay(transitionDelayMs, withTiming(1, {
            duration: transitionDurationMs,
            easing: Easing.inOut(Easing.cubic)
         }, (finished) => {
            if (finished) scheduleOnRN(setTransitionComplete, true)
         }))

         return () => clearTimeout(headerDelay)
      }

      setHeaderCompact(false)
      artworkProgress.value = withDelay(transitionDelayMs, withTiming(0, {
         duration: transitionDurationMs,
         easing: Easing.inOut(Easing.cubic)
      }))
      infoProgress.value = withTiming(0, {
         duration: transitionDurationMs,
         easing: Easing.inOut(Easing.cubic)
      })
      return
   }, [showLyrics, artworkProgress, infoProgress])

   const artworkAnimatedStyle = useAnimatedStyle(() => {
      const compactSize = layoutSize.width * 0.2
      const expandedHeight = layoutSize.height * 0.6 * 0.75
      const progress = artworkProgress.value

      return {
         width: layoutSize.width + (compactSize - layoutSize.width) * progress,
         height: expandedHeight + (compactSize - expandedHeight) * progress
      }
   }, [layoutSize, artworkProgress])

   const trackInfoAnimatedStyle = useAnimatedStyle(() => {
      const progress = infoProgress.value
      const expandedHeaderHeight = layoutSize.height * 0.6
      const expandedInfoHeight = expandedHeaderHeight * 0.25
      const compactInfoLeft = layoutSize.width * 0.2 + 12
      const compactInfoHeight = layoutSize.width * 0.2

      return {
         left: compactInfoLeft * progress,
         top: expandedHeaderHeight - expandedInfoHeight - (expandedHeaderHeight - expandedInfoHeight) * progress,
         width: layoutSize.width - compactInfoLeft * progress,
         height: expandedInfoHeight + (compactInfoHeight - expandedInfoHeight) * progress
      }
   }, [layoutSize, infoProgress])

   const playbackControlsAnimatedStyle = useAnimatedStyle(() => ({
      height: `${playbackControlsHeight.value}%` as `${number}%`
   }), [playbackControlsHeight])

   const handleLayout = (event: LayoutChangeEvent) => {
      const { width, height } = event.nativeEvent.layout
      setLayoutSize(previous => previous.width === width && previous.height === height ? previous : { width, height })
   }

   return (
      <View style={styles.container} onLayout={handleLayout}>
         <Animated.View layout={layoutTransition} style={[styles.header, headerCompact && styles.compactHeader]}>
            <Animated.View style={[styles.artworkSlot, artworkAnimatedStyle]}>
               <PlayerArtwork
                  artwork={track.artwork}
                  unknownTrackImageUri={unknownTrackImageUri}
                  onPress={onOpenLyrics}
                  compact={showLyrics}
               />
            </Animated.View>

            <Animated.View style={[styles.trackInfo, trackInfoAnimatedStyle]}>
               <View style={styles.titleRow}>
                  <View style={styles.trackTitleContainer}>
                     <MovingText text={track.title ?? ''} animationThreshold={30} style={styles.trackTitleText} />
                  </View>
                  <View style={styles.trackActions}>
                     {showLyrics && transitionComplete && (
                        <Animated.View entering={FadeIn.duration(300)} exiting={FadeOut.duration(300)}>
                           <TouchableOpacity onPress={onToggleLyricsType} accessibilityRole="button" accessibilityLabel={syncedLyrics ? 'Cambiar a letras sin sincronizar' : 'Cambiar a letras sincronizadas'}>
                              <FontAwesome name={syncedLyrics ? 'microphone' : 'microphone-slash'} size={20} color={colors.icon} style={styles.actionIcon} />
                           </TouchableOpacity>
                        </Animated.View>
                     )}
                     <TrackActions isFavorite={isFavorite} onToggleFavorite={onToggleFavorite} onEditLyricId={onEditLyricId} />
                  </View>
               </View>

               <View style={styles.subtitleRow}>
                  <TouchableOpacity onPress={onArtistPress} disabled={!track.artist} style={styles.artistContainer}>
                     <Text numberOfLines={1} style={styles.trackArtistText}>{track.artist ?? ''}</Text>
                  </TouchableOpacity>
               </View>
            </Animated.View>
         </Animated.View>

         <View style={styles.lyricsSpace}>
            {showLyrics && transitionComplete && <PlayerLyricsView track={track} />}
         </View>

         <Animated.View style={[styles.playbackControls, playbackControlsAnimatedStyle]}>
            <PlayerProgressbar style={{marginTop: 18}} />
            <PlayerControls style={{marginTop: 15}} />
            <PlayerVolumenbar style={{marginTop: 35, marginBottom: 14}} />
         </Animated.View>
      </View>
   )
}

const TrackActions = ({ isFavorite, onToggleFavorite, onEditLyricId }: { isFavorite: boolean; onToggleFavorite: () => void; onEditLyricId: () => void }) => (
   <View style={styles.trackActions}>
      <TouchableOpacity onPress={onEditLyricId} accessibilityRole="button" accessibilityLabel="Editar identificador de letra">
         <MaterialIcons name="info-outline" size={26} color={colors.icon} style={styles.actionIcon} />
      </TouchableOpacity>
      <TouchableOpacity onPress={onToggleFavorite} accessibilityRole="button" accessibilityLabel={isFavorite ? 'Quitar de favoritos' : 'Añadir a favoritos'}>
         <FontAwesome name={isFavorite ? 'heart' : 'heart-o'} size={26} color={isFavorite ? colors.primary : colors.icon} style={styles.actionIcon} />
      </TouchableOpacity>
   </View>
)

const styles = StyleSheet.create({
   container: { flex: 1 },
   header: {
      flex: 0,
      height: '60%',
      justifyContent: 'space-between',
      alignItems: 'center'
   },
   compactHeader: {
      height: '12%',
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      gap: 12
   },
   artworkSlot: { position: 'absolute', top: 0, left: 0, overflow: 'hidden' },
   trackInfo: {
      position: 'absolute',
      justifyContent: 'center',
      zIndex: 1
   },
   trackTitleContainer: { flex: 1, overflow: 'hidden' },
   titleRow: { flexDirection: 'row', alignItems: 'center' },
   trackTitleText: {
      ...defaultStyles.text,
      fontSize: 22,
      fontWeight: '700'
   },
   subtitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: 6
   },
   artistContainer: { flex: 1, overflow: 'hidden' },
   trackArtistText: {
      ...defaultStyles.text,
      fontSize: fontSize.base,
      opacity: 0.8
   },
   trackActions: { flexDirection: 'row', alignItems: 'center', marginRight: 0 },
   actionIcon: { marginLeft: 10, marginRight: 0 },
   lyricsSpace: { flex: 1 },
   playbackControls: {
      justifyContent: 'center'
   }
})

export default PlayerArtworkView
