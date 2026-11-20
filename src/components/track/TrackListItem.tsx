import { unknownTrackImageUri } from '@/constants/images';
import { colors, fontSize } from '@/constants/tokens';
import { defaultStyles } from '@/styles';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import TrackPlayer, { useActiveTrack, useIsPlaying } from '@/helpers/track-player-compat';
import { Track, Playlist } from '@/helpers/types';
import { Entypo, Ionicons } from "@expo/vector-icons"
import { LoaderKitView } from "react-native-loader-kit"
import { StopPropagation } from '@/components/utils/StopPropagation';
import { useState } from 'react';
import FontAwesome6 from '@expo/vector-icons/FontAwesome6';
import { DropdownMenu, MenuOption } from '../other/DropdownMenu';
import { useLibraryStore } from '@/store/library';
import { useQueue } from '@/store/queue';
import { usePlaylistStore } from '@/store/playlist';
import { showToast } from '@/helpers/toast';
import { useRouter } from 'expo-router';

export type TrackListItemProps = {
    track: Track
    onTrackSelect:(track : Track) => void
    fromPlaylist?: Playlist
}

export const TrackListItem = ({track, onTrackSelect : handleTrackSelect, fromPlaylist} : TrackListItemProps) => {
    const router = useRouter()
    const { playing } = useIsPlaying()
    const activeTrack = useActiveTrack();
    const isActiveTrack = activeTrack?.url === track.url

    const [visible, setVisible] = useState(false)

    const { toggleTrackFavorite } = useLibraryStore()
    const { activeQueueId } = useQueue()
    const { removeToPlaylist } = usePlaylistStore()

    const handleToggleFavorite = () => {
        if(track.rating === 1){
            toggleTrackFavorite(track)
            
            if(activeQueueId?.startsWith('favorites')) {
                const queue = TrackPlayer.getQueue()

                const trackToRemove = queue.findIndex(queueTrack => queueTrack.url === track.url)

                TrackPlayer.remove(trackToRemove)
            }

            showToast('Eliminado de Favoritos')
        } else {
            toggleTrackFavorite(track)
            
            if(activeQueueId?.startsWith('favorites')) {
                TrackPlayer.add(track)
            }
    
            showToast('Agregado a Favoritos')
        }
    }

    const handleAddToPlaylist = () => {
        router.push({pathname: '/(modals)/addToPlaylist', params: { trackUrl: track.url }})
    }

    const handleFromToPlaylist = () => {
        if(!fromPlaylist) return

        removeToPlaylist(track.url, fromPlaylist.id)
        showToast(`Eliminado de ${fromPlaylist!.name}`)
    }

    return (
        <TouchableOpacity onPress={() => handleTrackSelect(track)}>
            <View style={styles.trackItemContainer}>
                <View>
                    <FastImage
                        source={{
                            uri: track.artwork ?? unknownTrackImageUri
                        }}
                        style={{
                            ...styles.trackArtworkImage,
                            opacity: isActiveTrack ? 0.6 : 1
                        }}
                    />

                    {
                        isActiveTrack &&
                            (playing
                                ? <LoaderKitView style={styles.trackPlayingIconIndicator} name='LineScaleParty' color={colors.icon} />
                                : <Ionicons style={styles.trackPausedIndicator} name='play' size={24} color={colors.icon} />
                            )
                    }
                </View>

                <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                    {/* Track title + artist */}
                    <View style={{flex: 1}}>
                        <Text
                            numberOfLines={1}
                            style={{
                                ...styles.trackTitleText,
                                color: isActiveTrack ? colors.primary : colors.text
                            }}
                        >{track.title}</Text>

                        {track.artist && (
                            <Text numberOfLines={1} style={styles.trackArtistText} >{track.artist}</Text>
                        )}
                    </View>
                    
                    <StopPropagation>
                        <DropdownMenu
                            visible={visible}
                            handleOpen={() => setVisible(true)}
                            handleClose={() => setVisible(false)}
                            trigger={
                                <View style={{padding: 15, flex: 1}}>
                                    <Entypo name='dots-three-horizontal' size={18} color={colors.icon} />
                                </View>
                            }
                            dropdownWidth={220}
                        >
                            <MenuOption onSelect={handleToggleFavorite}>
                                {(track.rating === 1)
                                    ? <FontAwesome6 name="heart-crack" size={18} color={colors.text} />
                                    : <FontAwesome6 name="heart" size={18} color={colors.text} />}
                                <Text style={styles.menuOptionText}>{(track.rating === 1) ? 'Quitar favorito' : 'Añadir favorito'}</Text>
                            </MenuOption>
                            <MenuOption onSelect={handleAddToPlaylist}>
                                <FontAwesome6 name="compact-disc" size={18} color={colors.text} />
                                <Text style={styles.menuOptionText}>Añadir a playlist</Text>
                            </MenuOption>
                            {(fromPlaylist) ?
                                <MenuOption onSelect={handleFromToPlaylist} separatorBefore>
                                    <FontAwesome6 name="minus" size={18} color={colors.text} />
                                    <Text style={styles.menuOptionText}>Quitar de lista</Text>
                                </MenuOption>
                                :
                                null
                            }
                        </DropdownMenu>
                    </StopPropagation>
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
        fontSize: 14,
        marginTop: 4
    },
    menuOptionText: {
        color: colors.text,
        fontSize: 16,
        fontWeight: '500',
    }
})
