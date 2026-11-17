import { MovingText } from '@/components/other/MovingText'
import { ArtworkFlip } from '@/components/player/ArtworkFlip'
import { PlayerControls } from '@/components/player/PlayerControls'
import { PlayerProgressbar } from '@/components/player/PlayerProgressbar'
import { PlayerRepeatToggle } from '@/components/player/PlayerRepeatToggle'
import { PlayerVolumenbar } from '@/components/player/PlayerVolumenbar'
import { unknownTrackImageUri } from '@/constants/images'
import { colors, fontSize } from '@/constants/tokens'
import type { Track } from '@/helpers/types'
import { defaultStyles, utilsStyles } from '@/styles'
import { FontAwesome, MaterialIcons } from '@expo/vector-icons'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'

interface PlayerArtworkViewProps {
   track: Track
   isFavorite: boolean
   onToggleFavorite: () => void
   onOpenLyrics: () => void
   onEditLyricId: () => void
   onArtistPress: () => void
}

const PlayerArtworkView = ({ track, isFavorite, onToggleFavorite, onOpenLyrics, onEditLyricId, onArtistPress }: Readonly<PlayerArtworkViewProps>) => {
   return (
      <>
         <ArtworkFlip artwork={track.artwork} unknownTrackImageUri={unknownTrackImageUri} onPress={onOpenLyrics} />

         <View style={{flex: 1}}>
            <View style={{marginTop: 'auto'}}>
               <View style={{height: 60}}>
                     <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                        <View style={styles.trackTitleContainer}>
                           <MovingText text={track.title ?? ''} animationThreshold={30} style={styles.trackTitleText} />
                        </View>

                        <TouchableOpacity onPress={onEditLyricId}>
                           <MaterialIcons
                                 name="info-outline"
                                 size={30}
                                 color={colors.icon}
                                 style={{marginHorizontal: 14}}
                           />
                        </TouchableOpacity>

                        <TouchableOpacity onPress={onToggleFavorite}>
                           <FontAwesome
                                 name={isFavorite ? 'heart' : 'heart-o'}
                                 size={30}
                                 color={isFavorite ? colors.primary : colors.icon}
                                 style={{marginHorizontal: 14}}
                           />
                        </TouchableOpacity>
                     </View>

                     {track.artist && (
                        <TouchableOpacity
                           onPress={onArtistPress}
                        >
                           <Text
                              numberOfLines={1}
                              style={[styles.trackArtistText, {marginTop: 6}]}
                           >
                              {track.artist}
                           </Text>
                        </TouchableOpacity>
                     )}
               </View>

               <PlayerProgressbar style={{marginTop: 32}} />
               <PlayerControls style={{marginTop: 40}} />
            </View>

            <PlayerVolumenbar style={{marginTop: 'auto', marginBottom: 30}} />

            <View style={utilsStyles.centeredRow}>
               <PlayerRepeatToggle size={30} style={{marginBottom: 6}} />
            </View>
         </View>
         </>
   )
}

const styles = StyleSheet.create({
   trackTitleContainer: {
      flex: 1,
      overflow: 'hidden'
   },
   trackTitleText: {
      ...defaultStyles.text,
      fontSize: 22,
      fontWeight: '700'
   },
   trackArtistText: {
      ...defaultStyles.text,
      fontSize: fontSize.base,
      opacity: 0.8,
      maxWidth: '90%'
   }
})

export default PlayerArtworkView