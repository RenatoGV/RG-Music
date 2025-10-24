import { unknownTrackImageUri } from '@/constants/images';
import { colors, fontSize } from '@/constants/tokens';
import { defaultStyles } from '@/styles';
import { StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import TrackPlayer, { Track, useActiveTrack, useIsPlaying } from 'react-native-track-player';
import { Entypo, Ionicons } from "@expo/vector-icons"
import LoaderKit from "react-native-loader-kit"
import { StopPropagation } from '@/components/utils/StopPropagation';
import { Playlist } from '@/helpers/types';
import { useEffect, useState } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
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
    const [isActiveTrack, setIsActiveTrack] = useState(false)

    const [visible, setVisible] = useState(false)

    const activeTrack = useActiveTrack();
    
    const { toggleTrackFavorite } = useLibraryStore()
    const { activeQueueId } = useQueue()
    const { removeToPlaylist } = usePlaylistStore()

    const handleToggleFavorite = async () => {
        setVisible(false)
        if(track.rating === 1){
            toggleTrackFavorite(track)
            
            if(activeQueueId?.startsWith('favorites')) {
                const queue = await TrackPlayer.getQueue()

                const trackToRemove = queue.findIndex(queueTrack => queueTrack.url = track.url)

                await TrackPlayer.remove(trackToRemove)
            }

            showToast('Eliminado de Favoritos')
        } else {
            toggleTrackFavorite(track)
            
            if(activeQueueId?.startsWith('favorites')) {
                await TrackPlayer.add(track)
            }
    
            showToast('Agregado a Favoritos')
        }
    }

    const handleAddToPlaylist = () => {
        setVisible(false)
        router.push({pathname: '/(modals)/addToPlaylist', params: { trackUrl: track.url }})
    }

    const handleFromToPlaylist = () => {
        setVisible(false)
        removeToPlaylist(track.url, fromPlaylist!)
        showToast(`Eliminado de ${fromPlaylist!.name}`)
    }

    useEffect(() => {
        setIsActiveTrack(activeTrack?.url === track.url)
    }, [activeTrack])

  return (
    <TouchableHighlight onPress={() => handleTrackSelect(track)}>
        <View style={styles.trackItemContainer}>
            <View>
                <FastImage
                    source={{
                        uri: track.artwork ?? unknownTrackImageUri,
                        priority: FastImage.priority.normal
                    }}
                    style={{
                        ...styles.trackArtworkImage,
                        opacity: isActiveTrack ? 0.6 : 1
                    }}
                />

                {
                    isActiveTrack &&
                        (playing
                            ? <LoaderKit style={styles.trackPlayingIconIndicator} name='LineScaleParty' color={colors.icon} />
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
                            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                                {(track.rating === 1) ? <FontAwesome6 name="heart-crack" size={18} color={colors.primary} /> : <FontAwesome name="heart" size={15} color={colors.primary} />}
                                <Text style={{color: colors.primary, fontSize: 18}}>{(track.rating === 1) ? 'Quitar de Favoritos' : 'Agregar a Favoritos'}</Text>
                            </View>
                        </MenuOption>
                        <MenuOption onSelect={handleAddToPlaylist}>
                            <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                                <FontAwesome6 name="compact-disc" size={18} color="#2367A2" />
                                <Text style={{color: '#2367A2', fontSize: 18}}>Agregar a PlayList</Text>
                            </View>
                        </MenuOption>
                        {(fromPlaylist) ?
                            <MenuOption onSelect={handleFromToPlaylist}>
                                <View style={{flexDirection: 'row', alignItems: 'center', gap: 10}}>
                                    <FontAwesome name="remove" size={18} color="#9ca3af" />
                                    <Text style={{color: '#9ca3af', fontSize: 18}}>Quitar de PlayList</Text>
                                </View>
                            </MenuOption>
                            :
                            null
                        }
                    </DropdownMenu>
                </StopPropagation>
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