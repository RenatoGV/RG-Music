import { MovingText } from '@/components/other/MovingText'
import { unknownTrackImageUri } from '@/constants/images'
import { colors, fontSize, screenPadding } from '@/constants/tokens'
import { defaultStyles, utilsStyles } from '@/styles'
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useActiveTrack } from 'react-native-track-player'
import { FontAwesome, Ionicons } from '@expo/vector-icons'
import { PlayerControls } from '@/components/player/PlayerControls'
import { PlayerProgressbar } from '@/components/player/PlayerProgressbar'
import { PlayerVolumenbar } from '@/components/player/PlayerVolumenbar'
import { PlayerRepeatToggle } from '@/components/player/PlayerRepeatToggle'
import { usePlayerBackground } from '@/hooks/usePlayerBackground'
import { LinearGradient } from 'expo-linear-gradient'
import { useTrackPlayerFavorite } from '@/hooks/useTrackPlayerFavorite'
import { useState } from 'react'
import { Lyrics } from '@/components/player/Lyrics'
import { ArtworkFlip } from '@/components/player/ArtworkFlip'

const PlayerScreen = () => {
    const activeTrack = useActiveTrack()
    const {imageColors} = usePlayerBackground(activeTrack?.artwork ?? unknownTrackImageUri)
    const [showLyrics, setShowLyrics] = useState(false)

    const { top, bottom } = useSafeAreaInsets()
    
    const { isFavorite, toggleFavorite } = useTrackPlayerFavorite()

    if(!activeTrack) {
        return (
            <View style={[defaultStyles.container, {justifyContent: 'center'}]}>
                <ActivityIndicator color={colors.icon} />
            </View>
        )
    }

  return (
    <LinearGradient style={{flex: 1}} colors={imageColors ? [imageColors.average, imageColors.vibrant] : [colors.primary, colors.secondary, colors.background]}>
    {/* <LinearGradient style={{flex: 1}} colors={[colors.primary, colors.secondary, colors.background]}> */}
        <View style={styles.overlayContainer}>
            <DismissPlayerSymbol />

            <View style={{flex: 1, marginTop: top + 70, marginBottom: bottom}}>
                {
                    (showLyrics)
                    ? <>
                        <View style={{flex: 1, justifyContent: 'space-between', paddingBottom: 20}}>
                            <View style={{marginBottom: 10}}>
                                <Text style={styles.lyricTitle}>{activeTrack.title}</Text>
                                <Text style={styles.lyricArtist}>{activeTrack.artist}</Text>
                            </View>
                            {/* <StopPropagation> */}
                                <Lyrics artist={activeTrack.artist} track={activeTrack.title} />
                            {/* </StopPropagation> */}
                            <Ionicons
                                name={'arrow-back-circle-sharp'}
                                size={40}
                                color={colors.icon}
                                style={{marginHorizontal: 'auto', marginTop: 10}}
                                onPress={() => setShowLyrics(false)}
                            />
                        </View>
                      </>
                    : <>
                        <ArtworkFlip artwork={activeTrack.artwork} unknownTrackImageUri={unknownTrackImageUri} onPress={() => setShowLyrics(true)} />

                        <View style={{flex: 1}}>
                            <View style={{marginTop: 'auto'}}>
                                <View style={{height: 60}}>
                                    <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                                        {/* Track Title */}
                                        <View style={styles.trackTitleContainer}>
                                            <MovingText text={activeTrack.title ?? ''} animationThreshold={30} style={styles.trackTitleText} />
                                        </View>

                                        {/* Favorite Button Action */}
                                        <FontAwesome
                                            name={isFavorite ? 'heart' : 'heart-o'}
                                            size={30}
                                            color={isFavorite ? colors.primary : colors.icon}
                                            style={{marginHorizontal: 14}}
                                            onPress={toggleFavorite}
                                        />
                                    </View>

                                    {/* Track Artist */}
                                    {activeTrack.artist && (
                                        <Text numberOfLines={1} style={[styles.trackArtistText, {
                                            marginTop: 6
                                        }]}>{activeTrack.artist}</Text>
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
    },
    artworkImageContainer: {
        shadowOffset: {
            width: 0,
            height: 8
        },
        shadowOpacity: 0.44,
        shadowRadius: 11.0,
        flexDirection: 'row',
        justifyContent: 'center',
        height: '45%'
    },
    artworkImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
        borderRadius: 12
    },
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
    },
    cancelText: {
        color: colors.primary,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    lyricTitle: {
        color: colors.text,
        fontWeight: 'bold',
        textAlign: 'center',
        fontSize: 48
    },
    lyricArtist: {
        color: colors.textMuted,
        fontWeight: 'semibold',
        textAlign: 'center',
        fontSize: 24
    }
})

export default PlayerScreen