import { colors, fontSize } from '@/constants/tokens'
import { useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View, ScrollView, NativeScrollEvent, NativeSyntheticEvent, Dimensions } from 'react-native'
import { useProgress } from 'react-native-track-player'
import { useLyricStore } from '@/store/lyrics'
import Constants from 'expo-constants'
import { showToast } from '@/helpers/toast'
import { Animated } from 'react-native'

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
  lrcText = "[00:00.00] \n" + lrcText
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
      
      lyricLines.push({ time, content })
    }
  })

  return lyricLines
}

export const Lyrics = ({artist, track, lyricId} : Props) => {
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

const SyncedLyricsView = ({ lyrics }: { lyrics: string }) => {
  
  const { position } = useProgress(250)
  const [autoPlayLineIndex, setAutoPlayLineIndex] = useState(0)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  
  const lyricLines = parseLRC(lyrics)
  const scrollViewRef = useRef<ScrollView>(null)
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActiveIndexRef = useRef(0)
  const LINE_HEIGHT = 120
  const screenHeight = Dimensions.get('window').height
  const isAutoScrollingRef = useRef(false)

  const [animatedScales, setAnimatedScales] = useState<Animated.Value[]>([])

  useEffect(() => {
    const activeIndex = lyricLines.findIndex(
      (line, index) => {
        const nextLine = lyricLines[index + 1]
        return line.time <= position && (nextLine ? position < nextLine.time : true)
      }
    )
    
    const validIndex = Math.max(0, activeIndex)
    
    if (validIndex !== lastActiveIndexRef.current) {
      lastActiveIndexRef.current = validIndex
      setAutoPlayLineIndex(validIndex)
    }
  }, [position, lyricLines])

  useEffect(() => {
    if (!isUserScrolling && scrollViewRef.current) {
      isAutoScrollingRef.current = true

      scrollViewRef.current.scrollTo({
        y: autoPlayLineIndex * LINE_HEIGHT,
        animated: true
      })

      setTimeout(() => {
        isAutoScrollingRef.current = false
      }, 300)
    }
  }, [autoPlayLineIndex, isUserScrolling])

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const handleScrollBeginDrag = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    setIsUserScrolling(true)
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isAutoScrollingRef.current) return
    setScrollOffset(event.nativeEvent.contentOffset.y)
  }

  const handleScrollEndDrag = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false)
    }, 1000)
  }

  const activeLineIndex = isUserScrolling 
    ? Math.round(scrollOffset / LINE_HEIGHT)
    : autoPlayLineIndex

  useEffect(() => {
    if (!animatedScales.length) return

    animatedScales.forEach((anim, index) => {
      const distance = Math.abs(index - activeLineIndex)

      let targetScale = 1
      if (distance === 0) targetScale = 1
      else if (distance === 1) targetScale = 0.85
      else targetScale = 0.75

      Animated.spring(anim, {
        toValue: targetScale,
        useNativeDriver: true,
        speed: 20,
        bounciness: 6
      }).start()
    })
  }, [activeLineIndex, animatedScales])

  const getLineStyles = (distanceFromActive: number) => {
    const distance = Math.abs(distanceFromActive)
    let sizeMultiplier = 1
    let fontWeightValue: any = '400'
    let opacityValue = 0.3

    if (distance === 0) {
      sizeMultiplier = 1.4
      fontWeightValue = '900'
      opacityValue = 1
    } else if (distance === 1) {
      sizeMultiplier = 1.15
      fontWeightValue = '700'
      opacityValue = 0.65
    } else if (distance === 2) {
      sizeMultiplier = 1
      fontWeightValue = '500'
      opacityValue = 0.4
    }

    return {
      sizeMultiplier,
      fontWeightValue,
      opacityValue
    }
  }

  const centerPaddingHeight = (screenHeight / 3) - (LINE_HEIGHT / 2)

  useEffect(() => {
    setAnimatedScales(
      lyricLines.map(() => new Animated.Value(1))
    )
  }, [lyricLines.length])

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        snapToInterval={LINE_HEIGHT}
        decelerationRate="fast"
      >
        <View style={{ height: centerPaddingHeight }} />
        {lyricLines.map((line, index) => {
          const distanceFromActive = index - activeLineIndex
          const { sizeMultiplier, fontWeightValue, opacityValue } = getLineStyles(distanceFromActive)
          const isVisible = Math.abs(distanceFromActive) <= 2

          return (
            <View
              key={index}
              style={{
                height: LINE_HEIGHT,
                justifyContent: 'center',
                opacity: isVisible ? opacityValue : 0
              }}
            >
              {isVisible && (
                <Animated.Text
                  numberOfLines={4}
                  adjustsFontSizeToFit
                  style={{
                    color: colors.text,
                    fontSize: fontSize.lg * sizeMultiplier,
                    fontWeight: fontWeightValue,
                    textAlign: 'center',
                    opacity: opacityValue,
                    transform: [{ scale: animatedScales[index] ?? 1 }]
                  }}
                >
                  {line.content}
                </Animated.Text>
              )}
            </View>
          )
        })}
        <View style={{ height: centerPaddingHeight }} />
      </ScrollView>
    </View>
    
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
      color: colors.text
   }
})