import { colors, fontSize } from '@/constants/tokens';
import { ActivityIndicator, StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { useCallback, useState } from 'react';
import { useLyricStore } from '@/store/lyrics';
import { PlainLyricsView } from '@/components/lyrics/PlainLyricsView'
import { SyncedLyricsView } from '@/components/lyrics/SyncedLyricsView'
import { useLyrics } from '@/hooks/useLyrics';

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
      <View style={[styles.container, styles.fillContainer]}>
        <ActivityIndicator color="white" />
      </View>
    )
  }

  if (!lyrics) {
    return (
      <View style={[styles.container, styles.fillContainer]}>
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
            <SyncedLyricsContent key={syncedLyrics} lyrics={syncedLyrics} />
          :
            <PlainLyricsView lyrics={plainLyrics ?? ''} />
        }
      </View>
  )
}

const SyncedLyricsContent = ({ lyrics }: { lyrics: string }) => {
  const [positioned, setPositioned] = useState(false)
  const handlePositioned = useCallback(() => setPositioned(true), [])

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1, opacity: positioned ? 1 : 0 }} pointerEvents={positioned ? 'auto' : 'none'}>
        <SyncedLyricsView lyrics={lyrics} onPositioned={handlePositioned} />
      </View>
      {!positioned && (
        <View style={styles.initialPositionLoader}>
          <ActivityIndicator color="white" />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  fillContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  initialPositionLoader: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center'
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
