import { colors, fontSize } from '@/constants/tokens'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Lyric } from 'react-native-lyric'
import { useProgress } from 'react-native-track-player'
import { AnimatedLine } from '../lyrics/AnimatedLine'
import { ScrollView } from 'react-native-gesture-handler'

type Props = {
   artist: string | undefined
   track: string | undefined
}

export const Lyrics = ({artist, track} : Props) => {   
  const {position} = useProgress(250)
  const [lyric, setLyric] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLRC, setIsLRC] = useState(false)
   
  const buildVariants = (artist?: string, track?: string) => {
    if (!track) return []
    const variants = [{ artist: artist?.trim() ?? '', track: track.trim() }]

    const parts = track.split('-')
    if (parts.length === 2) {
      const [maybeTrack, maybeArtist] = parts.map(p => p.trim())
      variants.push(
        { artist: maybeArtist, track: maybeTrack },
        { artist: maybeTrack, track: maybeArtist }
      )
    }
    return variants
  }

  useEffect(() => {
    if (!track) return

    const controller = new AbortController()
    const fetchLyrics = async () => {
      setLoading(true)
      setError(null)
      setLyric(null)

      const variants = buildVariants(artist, track)

      for (const v of variants) {
        const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(v.artist)}&track_name=${encodeURIComponent(v.track)}`
        try {
          const res = await fetch(url, { signal: controller.signal })
          if (res.ok) {
            const data = await res.json()
            if (data?.syncedLyrics || data?.plainLyrics) {
              setLyric(data.syncedLyrics ?? data.plainLyrics)
              setIsLRC(data.syncedLyrics ? true : false)
              setLoading(false)
              return
            }
          }
        } catch (e) {
          if (controller.signal.aborted) return
          console.warn('Error probando:', url, e)
        }
      }

      setError('No lyrics found')
      setLoading(false)
    }

    fetchLyrics()

    return () => controller.abort()
  }, [artist, track])

   
  type LineRendererProps = {
    lrcLine: { content: string }
    active: boolean
  }

  const lineRenderer = useCallback(
    ({ lrcLine: { content }, active }: LineRendererProps) => (
      <AnimatedLine content={content} active={active} />
    ),
    []
  )

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator color="white" />
      </View>
    )
  }

  if (!lyric) {
    return (
      <View style={styles.container}>
        <Text style={{ color: colors.text }}>{error}</Text>
      </View>
    )
  }

  return (
      <View style={{flex: 1}}>
        {
          (isLRC) ?
            <Lyric
              lrc={lyric}
              currentTime={position * 1000}
              lineHeight={50}
              lineRenderer={lineRenderer}
              showsVerticalScrollIndicator={false}
            />
          :
            <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
              {lyric.split("\n").map((line, i) => (
                <Text key={i} style={{ color: colors.text, fontSize: fontSize.sm, paddingVertical: 10, textAlign: 'center'}}>
                  {line}
                </Text>
              ))}
            </ScrollView>
        }
      </View>
  )
}

const styles = StyleSheet.create({
   container: {
      alignItems: 'center'
   },
   lyrics: {
      textAlign: 'center',
      fontSize: fontSize.sm,
      color: colors.text
   }
})