import { colors, screenPadding } from '@/constants/tokens'
import { useLibraryStore } from '@/store/library'
import { defaultStyles } from '@/styles'
import { Album, getAlbumsAsync, getAssetsAsync, MediaType, requestPermissionsAsync } from 'expo-media-library'
import { useRouter } from 'expo-router'
import React, { useEffect, useState } from 'react'
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native'
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons'
import { importTracks } from '@/helpers/import'

export type AlbumWithPath = Album & {
  folderPath: string
}

const selectFolderModal = () => {
  const router = useRouter()

  const [albums, setAlbums] = useState<AlbumWithPath[]>([])

  useEffect(() => {
    (async () => {
      const { status } = await requestPermissionsAsync()
      if (status === 'granted') {
        const albums = await getAlbumsAsync()
        
        const filteredAlbums : AlbumWithPath[] = await Promise.all(
            albums.map(async (album) => {
                const assets = await getAssetsAsync({
                    album: album.id,
                    mediaType: [MediaType.audio],
                })

                if(assets.totalCount > 0 && assets.assets.length > 0) {
                  const firstAssetUri = assets.assets[0].uri
                  const folderPath = firstAssetUri.substring(0, firstAssetUri.lastIndexOf('/'))
                  return {...album, folderPath}
                }
                return null
            })
        ).then(results => results.filter((album): album is AlbumWithPath => album !== null))
        setAlbums(filteredAlbums)
      }
    })()
  }, [])

  const handleSelectFolder = async(album : Album) => {
    router.dismiss()
    await importTracks(album)
  }

  const renderItem = ({ item } : {item: AlbumWithPath}) => (
    <TouchableOpacity onPress={() => handleSelectFolder(item)} style={ styles.button }>
      <View style={styles.iconContainer}>
        <MaterialCommunityIcons name="folder-outline" size={50} color="white" />
      </View>
      <View>
        <Text style={styles.buttonTitle}>{item.title}</Text>
        <Text style={styles.buttonSubtitle}>{item.assetCount} canciones</Text>
        <Text style={{ fontSize: 12, color: colors.text }}>
            {item.folderPath}
        </Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <View style={{flex: 1, backgroundColor: colors.background, paddingHorizontal: screenPadding.horizontal}}>
      <FlatList
        data={albums}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        ItemSeparatorComponent={() => <View style={{height: 5}}/>}
      />
    </View>
  )
}

const styles = StyleSheet.create({
    button: {
        padding: 12,
        backgroundColor: 'rgba(47,47,47,0.5)',
        borderRadius: 2,
        flexDirection: 'row',
        alignItems: 'center',
        columnGap: 10
    },
    iconContainer: {
      backgroundColor: colors.primary,
      padding: 10,
      borderRadius: 10
    },
    buttonTitle: {
        ...defaultStyles.text,
        color: colors.primary,
        fontSize: 18
    },
    buttonSubtitle: {
      fontSize: 12,
      color: colors.text
    }
})

export default selectFolderModal