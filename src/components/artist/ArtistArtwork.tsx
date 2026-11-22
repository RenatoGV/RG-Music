import { unknownArtistImageUri, unknownPlaylistImageUri, unknownTrackImageUri } from '@/constants/images'
import type { Track } from '@/helpers/types'
import { StyleSheet, View } from 'react-native'
import FastImage from 'react-native-fast-image'

type ArtistArtworkProps = {
	tracks: Track[]
	size?: number
	width?: number
	height?: number
	borderRadius?: number
	fallbackArtworkUri?: string
}

export const ArtistArtwork = ({
	tracks,
	size = 56,
	width,
	height,
	borderRadius = 12,
	fallbackArtworkUri = unknownArtistImageUri,
}: ArtistArtworkProps) => {
	const artworks = tracks
		.map((track) => track.artwork?.trim())
		.filter((artwork): artwork is string => Boolean(artwork)
			&& artwork !== unknownArtistImageUri
			&& artwork !== unknownPlaylistImageUri
			&& artwork !== unknownTrackImageUri)
		.slice(0, 4)
	const containerStyle = [styles.container, { width: width ?? size, height: height ?? size, borderRadius }]

	if (artworks.length === 0) {
		return <FastImage source={{ uri: fallbackArtworkUri }} style={containerStyle} />
	}

	if (artworks.length === 3) {
		return (
			<View style={containerStyle}>
				<FastImage source={{ uri: artworks[0] }} style={styles.threeArtworkMain} />
				<View style={styles.threeArtworkSide}>
					<FastImage source={{ uri: artworks[1] }} style={styles.threeArtworkTile} />
					<FastImage source={{ uri: artworks[2] }} style={styles.threeArtworkTile} />
				</View>
			</View>
		)
	}

	return (
		<View style={containerStyle}>
			{artworks.map((artwork, index) => (
				<FastImage
					key={`${artwork}-${index}`}
					source={{ uri: artwork }}
					style={artworks.length === 1 ? styles.singleArtworkImage : artworks.length === 2 ? styles.halfArtworkTile : styles.quarterArtworkTile}
				/>
			))}
		</View>
	)
}

const styles = StyleSheet.create({
	container: {
		backgroundColor: 'rgba(255,255,255,0.08)',
		overflow: 'hidden',
		flexDirection: 'row',
		flexWrap: 'wrap',
	},
	singleArtworkImage: {
		width: '100%',
		height: '100%',
	},
	halfArtworkTile: {
		width: '50%',
		height: '100%',
	},
	quarterArtworkTile: {
		width: '50%',
		height: '50%',
	},
	threeArtworkMain: {
		width: '50%',
		height: '100%',
	},
	threeArtworkSide: {
		flex: 1,
		height: '100%',
	},
	threeArtworkTile: {
		width: '100%',
		height: '50%',
	},
})
