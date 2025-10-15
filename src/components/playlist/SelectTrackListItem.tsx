import { unknownTrackImageUri } from '@/constants/images';
import { colors, fontSize } from '@/constants/tokens';
import { defaultStyles } from '@/styles';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import { Track } from 'react-native-track-player';
import { useEffect, useState } from 'react';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export type TrackListItemProps = {
   track: Track
   onTrackSelect:(track : string) => void
   selectedTracks: string[]
}

export const SelectTrackListItem = ({track, onTrackSelect : handleTrackSelect, selectedTracks} : TrackListItemProps) => {
    const [isSelectedTrack, setIsSelectedTrack] = useState(false)

   useEffect(() => {
      setIsSelectedTrack(selectedTracks.some((trackItem) => track.url === trackItem ))
   }, [selectedTracks])

  return (
    <TouchableHighlight onPress={() => handleTrackSelect(track.url)}>
        <View style={styles.trackItemContainer}>
            {(isSelectedTrack) ? <FontAwesome6 name="square-check" size={24} color={colors.primary} /> : <FontAwesome6 name="square" size={24} color={colors.primary} />}
            
            <View>
                <FastImage
                    source={{
                        uri: track.artwork ?? unknownTrackImageUri,
                        priority: FastImage.priority.normal
                    }}
                    style={{
                        ...styles.trackArtworkImage,
                    }}
                />
            </View>

            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                {/* Track title + artist */}
                <View style={{flex: 1}}>
                    <Text
                        numberOfLines={1}
                        style={{
                            ...styles.trackTitleText,
                            color: colors.text
                        }}
                    >{track.title}</Text>

                    {track.artist && (
                        <Text numberOfLines={1} style={styles.trackArtistText} >{track.artist}</Text>
                    )}
                </View>
            </View>
        </View>
    </TouchableHighlight>
  )
}

const styles = StyleSheet.create({
    trackItemContainer: {
        flexDirection: 'row',
        columnGap: 14,
        alignItems: 'center',
    },
    trackPlayingIconIndicator: {
        position: 'absolute',
        top: 18,
        left: '35%',
        width: 16,
        height: 16
    },
    trackArtworkImage: {
        borderRadius: 8,
        width: 50,
        height: 50
    },
    trackPausedIndicator: {
        position: 'absolute',
        top: 14,
        left: 14
    },
    trackTitleText: {
        ...defaultStyles.text,
        fontSize: fontSize.sm,
        fontWeight: '600',
        maxWidth: '90%'
    },
    trackArtistText: {
        ...defaultStyles.text,
        color: colors.textMuted,
        fontSize: 14,
        marginTop: 4
    }
})