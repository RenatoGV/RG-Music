import { colors, fontSize } from '@/constants/tokens'
import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View, ScrollView, NativeScrollEvent, NativeSyntheticEvent, Dimensions, Animated } from 'react-native'
import { useProgress } from 'react-native-track-player'
import { useLyricStore } from '@/store/lyrics'
import Constants from 'expo-constants'
import { showToast } from '@/helpers/toast'

type Props = {
   artist: string | undefined
   track: string | undefined
   lyricId: string | undefined
}

interface LyricLine {
  time: number
  content: string
}

const parseLRC = (lrcText: string): LyricLine[] => {
  const lines = lrcText.split('\n')
  const lyricLines: LyricLine[] = []

  lines.forEach(line => {
    const timeMatch = line.match(/\[(\d{2}):(\d{2})\.(\d{2})\]/)
    if (timeMatch) {
      const minutes = parseInt(timeMatch[1])
      const seconds = parseInt(timeMatch[2])
      const centiseconds = parseInt(timeMatch[3])
      const time = minutes * 60 + seconds + centiseconds / 100
      const content = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').trim()
      
      if (content) {
        lyricLines.push({ time, content })
      }
    }
  })

  return lyricLines
}

export const Lyrics = ({artist, track, lyricId} : Props) => {
  const {position} = useProgress(250)
  const [lyric, setLyric] = useState<string | null>(null)
  const [syncedLyrics, setSyncedLyric] = useState<string | null>(null)
  const [plainLyrics, setPlainLyric] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLRC, setIsLRC] = useState(false)
  const {syncedLyrics : SL, setSyncedLyrics : setSL} = useLyricStore()
   
  const getVariants = (artist?: string, track?: string) => {
    if (!track) return []
    const variants = [{ artist: artist?.trim() ?? '', track: track.trim() }]

    const parts = track.split('-')
    if (parts.length === 2) {
      const [first, second] = parts.map(p => p.trim())
      variants.push(
        { artist: first, track: second },
        { artist: second, track: first }
      )
    }

    if(artist?.includes('/')) {
      const artists = artist.split('/')
      artists.map(a => {
        variants.push({
          artist: a,
          track: track
        })
      })
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

      if(lyricId?.length && lyricId.length > 0) {
        const url = `https://lrclib.net/api/get/${lyricId}`
        try {
          const res = await fetch(url, { signal: controller.signal, method: 'GET', headers: {
            'User-Agent': `RG Music v${Constants.expoConfig?.version || '1.0.0'} (https://github.com/RenatoGV/RG-Music)`,
            'Content-Type': 'application/json'
          }})

          if (res.ok) {
            const data = await res.json()
            if (data?.syncedLyrics || data?.plainLyrics) {

              setLyric((data.syncedLyrics && SL) ? data.syncedLyrics : data.plainLyrics)

              if(!data.syncedLyrics) setSL(false)

              setSyncedLyric(data.syncedLyrics ? data.syncedLyrics : null)
              setPlainLyric(data.plainLyrics)
              setIsLRC(data.syncedLyrics ? true : false)
              setLoading(false)
              return
            }
          }
        } catch (e) {
          if (controller.signal.aborted) return
          console.warn('Error:', url, e)
        }

        showToast("No se encontró lyrics por Id")
      }

      const variants = getVariants(artist, track)

      for (const v of variants) {
        const url = `https://lrclib.net/api/get?artist_name=${encodeURIComponent(v.artist)}&track_name=${encodeURIComponent(v.track)}`
        try {
          const res = await fetch(url, { signal: controller.signal, method: 'GET', headers: {
            'User-Agent': `RG Music v${Constants.expoConfig?.version || '1.0.0'} (https://github.com/RenatoGV/RG-Music)`,
            'Content-Type': 'application/json'
          }})

          if (res.ok) {
            const data = await res.json()
            if (data?.syncedLyrics || data?.plainLyrics) {

              setLyric((data.syncedLyrics && SL) ? data.syncedLyrics : data.plainLyrics)

              if(!data.syncedLyrics) setSL(false)

              setSyncedLyric(data.syncedLyrics ? data.syncedLyrics : null)
              setPlainLyric(data.plainLyrics)
              setIsLRC(data.syncedLyrics ? true : false)
              setLoading(false)
              return
            }
          }
        } catch (e) {
          if (controller.signal.aborted) return
          console.warn('Error:', url, e)
        }
      }

      setError('No lyrics found')
      setSyncedLyric(null)
      setPlainLyric(null)
      setLoading(false)
    }

    fetchLyrics()

    return () => controller.abort()
  }, [artist, track, lyricId])

  useEffect(() => {
    if(syncedLyrics != null) {
      setLyric( (SL) ? syncedLyrics : plainLyrics )
    }
  }, [SL])
  

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
          (isLRC && SL) ?
            <SyncedLyricsView lyrics={lyric} />
          :
            <PlainLyricsView lyrics={lyric} />
        }
      </View>
  )
}

const AnimatedLyricLine = ({ 
  line, 
  isActive,
  LINE_HEIGHT
}: { 
  line: LyricLine
  isActive: boolean
  LINE_HEIGHT: number
}) => {
  const animatedOpacity = useRef(new Animated.Value(0.4)).current

  useEffect(() => {
    Animated.timing(animatedOpacity, {
      toValue: isActive ? 1 : 0.4,
      duration: 200,
      useNativeDriver: true
    }).start()
  }, [isActive])

  return (
    <Animated.View
      style={{
        width: '100%',
        minHeight: LINE_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 10,
        opacity: animatedOpacity
      }}
    >
      <Text
        numberOfLines={2}
        ellipsizeMode="tail"
        style={{
          width: '100%',
          color: colors.text,
          fontSize: isActive ? fontSize.base : fontSize.sm,
          fontWeight: isActive ? '900' : '700',
          textAlign: 'center',
          paddingHorizontal: 20,
          lineHeight: (isActive ? fontSize.base : fontSize.sm) * 1.5
        }}
      >
        {line.content}
      </Text>
    </Animated.View>
  )
}

const SyncedLyricsView = ({ lyrics }: { lyrics: string }) => {
  
  const { position } = useProgress(250)
  const [activeLineIndex, setActiveLineIndex] = useState(-1)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const [lineHeights, setLineHeights] = useState<number[]>([])
  
  const lyricLines = parseLRC(lyrics)
  const scrollViewRef = useRef<ScrollView>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastPositionRef = useRef(-1)
  const BASE_LINE_HEIGHT = 70
  const screenHeight = Dimensions.get('window').height

  useEffect(() => {
    if (isUserScrolling) return

    if (Math.abs(position - lastPositionRef.current) < 0.1) return
    
    lastPositionRef.current = position

    const activeIndex = lyricLines.findIndex(
      (line, index) => {
        const nextLine = lyricLines[index + 1]
        return line.time <= position && (nextLine ? position < nextLine.time : true)
      }
    )
    
    if (activeIndex !== activeLineIndex) {
      setActiveLineIndex(activeIndex)
    }
  }, [position, lyricLines, isUserScrolling, activeLineIndex])

  useEffect(() => {
    if (!isUserScrolling && scrollViewRef.current && activeLineIndex >= 0) {
      let scrollPosition = 0
      for (let i = 0; i < activeLineIndex; i++) {
        scrollPosition += lineHeights[i] || BASE_LINE_HEIGHT
      }
      
      scrollViewRef.current.scrollTo({
        y: scrollPosition,
        animated: true
      })
    }
  }, [activeLineIndex, isUserScrolling, lineHeights])

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const handleScrollBeginDrag = () => {
    setIsUserScrolling(true)
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (!isUserScrolling) return

    const offsetY = event.nativeEvent.contentOffset.y
    
    let accumulatedHeight = 0
    let newActiveIndex = 0
    
    for (let i = 0; i < lyricLines.length; i++) {
      const height = lineHeights[i] || BASE_LINE_HEIGHT
      if (accumulatedHeight + height / 2 > offsetY) {
        newActiveIndex = i
        break
      }
      accumulatedHeight += height
    }
    
    if (newActiveIndex !== activeLineIndex) {
      setActiveLineIndex(newActiveIndex)
    }
  }

  const handleScrollEndDrag = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false)
    }, 2000)
  }

  const handleLineLayout = (index: number, height: number) => {
    setLineHeights(prev => {
      const newHeights = [...prev]
      newHeights[index] = height
      return newHeights
    })
  }

  return (
    <ScrollView
      ref={scrollViewRef}
      scrollEventThrottle={16}
      onScrollBeginDrag={handleScrollBeginDrag}
      onScroll={handleScroll}
      onScrollEndDrag={handleScrollEndDrag}
      onMomentumScrollEnd={handleScrollEndDrag}
      showsVerticalScrollIndicator={false}
      scrollEnabled={true}
      contentContainerStyle={{
        paddingBottom: screenHeight - BASE_LINE_HEIGHT
      }}
    >
      {lyricLines.map((line, index) => (
        <View
          key={`${index}-${line.time}`}
          onLayout={(event) => {
            const { height } = event.nativeEvent.layout
            handleLineLayout(index, height)
          }}
        >
          <AnimatedLyricLine
            line={line}
            isActive={index === activeLineIndex}
            LINE_HEIGHT={BASE_LINE_HEIGHT}
          />
        </View>
      ))}
    </ScrollView>
  )
}


const PlainLyricsView = ({ lyrics }: { lyrics: string }) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.lyrics}>{lyrics}</Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
   container: {
      alignItems: 'center'
   },
   lyrics: {
      textAlign: 'center',
      fontSize: fontSize.base,
      color: colors.text,
      fontWeight: '500'
   }
})