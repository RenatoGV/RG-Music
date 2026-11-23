import { unknownTrackImageUri } from '@/constants/images';
import { colors, fontSize } from '@/constants/tokens';
import { defaultStyles } from '@/styles';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import type { Track } from '@/helpers/types';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';

export type TrackListItemProps = {
    track: Track
    onTrackSelect:(track : string) => void
    selectedTracks: string[]
}

export const SelectTrackListItem = ({track, onTrackSelect : handleTrackSelect, selectedTracks} : TrackListItemProps) => {
    const isSelectedTrack = selectedTracks.includes(track.url)

    return (
        <TouchableOpacity activeOpacity={0.85} onPress={() => handleTrackSelect(track.url)}>
            <View style={styles.trackItemContainer}>
                {(isSelectedTrack) ? <FontAwesome6 name="circle-check" size={24} color={colors.primary} /> : <FontAwesome6 name="circle" size={24} color={colors.primary} />}
                
                <View>
                    <FastImage
                        source={{
                            uri: track.artwork ?? unknownTrackImageUri
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
        </TouchableOpacity>
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
        fontSize: fontSize.xs,
        marginTop: 4
    }
})
