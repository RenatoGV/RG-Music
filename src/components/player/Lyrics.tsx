import { colors, fontSize } from '@/constants/tokens'
import { useCallback, useEffect, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Lyric } from 'react-native-lyric'
import { useProgress } from 'react-native-track-player'
import { AnimatedLine } from '../lyrics/AnimatedLine'

type Props = {
   artist: string | undefined
   track: string | undefined
}

export const Lyrics = ({artist, track} : Props) => {   
   const {position} = useProgress(250)
   const [lyric, setLyric] = useState<string | null>(null)
   const [loading, setLoading] = useState(true)
   
   useEffect(() => {
      const fetchLyrics = async () => {
         try {
            if(artist != undefined && track != undefined){
               const res = await fetch(`https://lrclib.net/api/get?artist_name=${encodeURIComponent(artist)}&track_name=${encodeURIComponent(track)}`)
               if(!res.ok) throw new Error('Error fetching lyrics')
               
               const data = await res.json()
               setLyric(data.syncedLyrics || data.plainLyrics || null)
            }else{
               setLyric(null)
            }
         } catch (error) {
            console.error(error)
            setLyric(null)
         } finally {
            setLoading(false)
         }
      }

      fetchLyrics()
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
        <Text style={{ color: 'gray' }}>No lyrics found</Text>
      </View>
    )
  }

  return (
    <View style={{ flex: 1 }}>
      <Lyric
        style={{ flex: 1 }}
        lrc={lyric}
        currentTime={position * 1000} // react-native-lyric usa milisegundos
        lineHeight={50}
        lineRenderer={lineRenderer}
      />
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