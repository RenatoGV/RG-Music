import { unknownArtistImageUri } from '@/constants/images'
import { screenPadding } from '@/constants/tokens'
import { filterArtistsByName } from '@/helpers/filter'
import { useNavigationSearch } from '@/hooks/useNavigationSearch'
import { useTabContentBottomPadding } from '@/hooks/useTabContentBottomPadding'
import { useArtists } from '@/store/library'
import { defaultStyles, utilsStyles } from '@/styles'
import { Link } from 'expo-router'
import { useMemo } from 'react'
import { FlatList, StyleSheet, Text, TouchableHighlight, View } from 'react-native'
import FastImage from 'react-native-fast-image'

const ItemSeparatorComponent = () => {
	return <View style={[utilsStyles.itemSeparator, { marginLeft: 50, marginVertical: 12 }]} />
}

const ArtistsScreen = () => {
	const contentBottomPadding = useTabContentBottomPadding()
	const search = useNavigationSearch({
		searchBarOptions: {
			placeholder: 'Buscar Artista',
			shouldShowHintSearchIcon: false,
		},
	})

	const artists = useArtists()

	const sortedArtists = useMemo(
      () => [...(artists ?? [])].sort((a, b) => a.name.localeCompare(b.name)),
      [artists]
   )

   const filteredArtists = filterArtistsByName(sortedArtists, search)

	return (
		<View style={{ ...defaultStyles.container, paddingHorizontal: screenPadding.horizontal }}>
			<FlatList
				contentContainerStyle={{ paddingTop: 10, paddingBottom: contentBottomPadding }}
				ItemSeparatorComponent={ItemSeparatorComponent}
				ListEmptyComponent={
					<View>
						<Text>No se encontraron artistas</Text>
						<FastImage
							source={{ uri: unknownArtistImageUri }}
							style={utilsStyles.emptyContentImage}
						/>
					</View>
				}
				data={filteredArtists}
				renderItem={({ item: artist }) => {
					return (
						<Link href={`/artists/${artist.name}`} asChild>
							<TouchableHighlight activeOpacity={0.8}>
								<View style={styles.artistItemContainer}>
									<View>
										<FastImage
											source={{ uri: unknownArtistImageUri }}
											style={styles.artistImage}
										/>
									</View>
									<View style={{ width: '100%' }}>
										<Text numberOfLines={1} style={styles.artistNameText}>
											{artist.name}
										</Text>
									</View>
								</View>
							</TouchableHighlight>
						</Link>
					)
				}}
			/>
		</View>
	)
}

const styles = StyleSheet.create({
	artistItemContainer: {
		flexDirection: 'row',
		columnGap: 14,
		alignItems: 'center',
	},
	artistImage: {
		borderRadius: 32,
		width: 40,
		height: 40,
	},
	artistNameText: {
		...defaultStyles.text,
		fontSize: 17,
		maxWidth: '80%',
	},
})

export default ArtistsScreen
