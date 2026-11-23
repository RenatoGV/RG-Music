import type { Playlist, Track } from '@/helpers/types'
import { defaultStyles } from '@/styles'
import { StyleSheet, Text, TouchableHighlightProps, TouchableOpacity, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { colors, fontSize } from '@/constants/tokens'
import { unknownPlaylistImageUri } from '@/constants/images'
import { useTracks } from '@/store/library'
import { useMemo } from 'react'
import { ArtistArtwork } from '@/components/artist/ArtistArtwork'

type PlaylistListItemProps = {
    playlist: Playlist
} & TouchableHighlightProps

export const PlaylistListItem = ({playlist, ...props}: PlaylistListItemProps) => {
    const tracks = useTracks()
    const playlistTracks = useMemo(
        () => (tracks ?? [])
            .filter((track) => playlist.tracksUri.includes(track.url))
            .sort((a, b) => a.title.localeCompare(b.title)),
        [tracks, playlist.tracksUri]
    )
    const subtitle = getPlaylistSubtitle(playlistTracks)

    return (
        <TouchableOpacity activeOpacity={0.8} {...props}>
            <View style={styles.playlistItemContainer}>
                <ArtistArtwork
                    tracks={playlistTracks}
                    size={70}
                    borderRadius={12}
                    fallbackArtworkUri={unknownPlaylistImageUri}
                />

                <View style={styles.playlistTextContainer}>
                    <Text numberOfLines={1} style={styles.playlistNameText}>{playlist.name}</Text>
                    <Text numberOfLines={1} style={styles.playlistSubtitleText}>{subtitle}</Text>
                </View>

                <View style={styles.trailingIcon}>
                    <MaterialIcons name="navigate-next" size={30} color={colors.textMuted} />
                </View>
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
	playlistItemContainer: {
		flexDirection: 'row',
		columnGap: 14,
		alignItems: 'center',
		minHeight: 84,
	},
	playlistTextContainer: {
		flex: 1,
		justifyContent: 'center',
		minWidth: 0,
	},
	playlistNameText: {
		...defaultStyles.text,
		fontSize: fontSize.sm,
		fontWeight: '600',
	},
	playlistSubtitleText: {
		...defaultStyles.text,
		color: colors.textMuted,
		fontSize: fontSize.xs,
		marginTop: 3,
	},
	trailingIcon: {
		alignItems: 'center',
		justifyContent: 'center',
	},
})

const getPlaylistSubtitle = (tracks: Track[]) => {
    const count = tracks.length
    const countLabel = `${count} ${count === 1 ? 'canción' : 'canciones'}`
    const hasAllDurations = count > 0 && tracks.every((track) => typeof track.duration === 'number' && track.duration > 0)
    if (!hasAllDurations) return countLabel

    const totalMinutes = Math.round(tracks.reduce((total, track) => total + (track.duration ?? 0), 0) / 60)
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60
    const durationLabel = hours === 0
        ? `${totalMinutes} ${totalMinutes === 1 ? 'minuto' : 'minutos'}`
        : minutes === 0
            ? `${hours} ${hours === 1 ? 'hora' : 'horas'}`
            : `${hours} h ${minutes} min`

    return `${countLabel} • ${durationLabel}`
}
