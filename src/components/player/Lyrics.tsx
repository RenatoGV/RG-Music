import { colors, fontSize } from '@/constants/tokens';
import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useLyricStore } from '@/store/lyrics';
import SyncedLyricsView from '../lyrics/SyncedLyricsView';
import PlainLyricsView from '../lyrics/PlainLyricsView';
import { useLyrics } from './useLyrics';

type Props = {
  trackUrl: string
  artist: string | undefined
  track: string | undefined
  lyricId: string | undefined
}

export const Lyrics = ({trackUrl, track, artist, lyricId} : Props) => {
  const prefersSyncedLyrics = useLyricStore((state) => state.syncedLyrics)

  const { lyrics, loading, error, retry } = useLyrics({ trackUrl, track, artist, lyricId })

  if (!track) return null

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="white" />
      </View>
    )
  }

  if (!lyrics) {
    return (
      <View style={styles.container}>
        <Text style={styles.textError}>{error}</Text>

        <TouchableOpacity style={styles.retryButton} onPress={retry}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const { syncedLyrics, plainLyrics } = lyrics

  return (
      <View style={{flex: 1}}>
        {
          (syncedLyrics && (prefersSyncedLyrics || !plainLyrics)) ?
            <SyncedLyricsView key={syncedLyrics} lyrics={syncedLyrics} />
          :
            <PlainLyricsView lyrics={plainLyrics ?? ''} />
        }
      </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  textError: {
    color: colors.text,
    fontSize: fontSize.base
  },
  retryButton: {
    marginTop: 15,
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderColor: colors.textMuted,
    borderStyle: 'solid',
    borderRadius: 5,
    borderWidth: 1
  },
  retryText: {
    color: colors.textMuted,
    fontSize: fontSize.base
  }
})
