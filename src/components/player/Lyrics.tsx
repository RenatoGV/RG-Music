import { useFonts } from 'expo-font';
import { colors, fontSize } from '@/constants/tokens'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View, ScrollView, NativeScrollEvent, NativeSyntheticEvent, Dimensions, TouchableOpacity, type ScrollViewInstance } from 'react-native'
import { useProgress } from '@/helpers/track-player-compat'
import { useLyricStore } from '@/store/lyrics'
import { Animated } from 'react-native'
import { LyricsData, lyricsService } from '@/services/lyricsService'
import { isAxiosError } from 'axios'

type Props = {
  trackUrl: string
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
    const timeMatch = /\[(\d{2}):(\d{2})\.(\d{2})\]/.exec(line)
    if (timeMatch) {
      const minutes = Number.parseInt(timeMatch[1])
      const seconds = Number.parseInt(timeMatch[2])
      const centiseconds = Number.parseInt(timeMatch[3])
      const time = minutes * 60 + seconds + centiseconds / 100
      const content = line.replace(/\[\d{2}:\d{2}\.\d{2}\]/g, '').trim()

      const text = content || '♪'
      const previousLine = lyricLines.at(-1)

      if(text === '♪' && previousLine?.content === '♪') return
      
      lyricLines.push({ time, content: text })
    }
  })

  return lyricLines.filter((line, index) => {
    if(line.content !== '♪') return true

    const nextLine = lyricLines[index + 1]

    // Si es la última línea, su duración depende del final del track
    if(!nextLine) return true

    const durationMs = Math.round((nextLine.time - line.time) * 1000)

    return durationMs >= 5000
  })
}

export const Lyrics = ({trackUrl, track, artist, lyricId} : Props) => {
  const [lyrics, setLyrics] = useState<LyricsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryKey, setRetryKey] = useState(0)

  const prefersSyncedLyrics = useLyricStore((state) => state.syncedLyrics)

  useEffect(() => {
    if (!track) return

    const controller = new AbortController()

    setLyrics(null)
    setError(null)
    setLoading(true)

    const fetchLyrics = async () => {
      try {
        const data = await lyricsService.getLyrics({ trackUrl, track, artist, lyricId, signal: controller.signal})

        if (controller.signal.aborted) return

        if (data) setLyrics(data)
        else setError('No se encontró la letra')
      } catch (error) {
        if (controller.signal.aborted) return

        if (isAxiosError(error) && error.code === 'ECONNABORTED') {
          setError('La conexión tardó demasiado')
        } else if (isAxiosError(error) && error.code === 'ERR_NETWORK') {
          setError('Error de red. Verifica tu conexión a internet')
        } else {
          setError('Error al cargar la letra')
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false)
        }
      }
    }

    void fetchLyrics()

    return () => controller.abort()
  }, [track, artist, lyricId, retryKey])

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

        <TouchableOpacity style={styles.retryButton} onPress={() => setRetryKey(v => v + 1)}>
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

const SyncedLyricsView = ({ lyrics }: { lyrics: string }) => {
  const { position } = useProgress(250)
  const [autoPlayLineIndex, setAutoPlayLineIndex] = useState(0)
  const [scrollOffset, setScrollOffset] = useState(0)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  
  const lyricLines = useMemo(() => parseLRC(lyrics), [lyrics])
  const scrollViewRef = useRef<ScrollViewInstance | null>(null)
  const scrollTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastActiveIndexRef = useRef(0)
  const screenHeight = Dimensions.get('window').height
  const minLineHeight = 64
  const [viewportHeight, setViewportHeight] = useState(0)
  const [lineCenters, setLineCenters] = useState<Record<number, number>>({})
  const anchorY = Math.min(screenHeight / 3.5, viewportHeight / 2)
  const snapOffsets = useMemo(
    () => Object.values(lineCenters).map((center) => Math.max(0, center - anchorY)),
    [lineCenters, anchorY]
  )
  const activeCenter = lineCenters[autoPlayLineIndex]
  const activeOffset = activeCenter === undefined
    ? undefined
    : Math.max(0, activeCenter - anchorY)

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
    if (!isUserScrolling && viewportHeight > 0 && activeOffset !== undefined) {
      scrollViewRef.current?.scrollTo({
        y: activeOffset,
        animated: true
      })
    }
  }, [activeOffset, isUserScrolling, viewportHeight])

  useEffect(() => {
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current)
      }
    }
  }, [])

  const handleScrollBeginDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }
    setScrollOffset(event.nativeEvent.contentOffset.y)
    setIsUserScrolling(true)
  }

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isUserScrolling) setScrollOffset(event.nativeEvent.contentOffset.y)
  }

  const handleScrollEndDrag = () => {
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current)
    }

    scrollTimeoutRef.current = setTimeout(() => {
      setIsUserScrolling(false)
    }, 1000)
  }

  const hasMeasuredLines = lyricLines.length > 0 && snapOffsets.length === lyricLines.length
  let activeLineIndex = autoPlayLineIndex

  if (isUserScrolling && hasMeasuredLines) {
    let closestDistance = Infinity
    snapOffsets.forEach((offset, index) => {
      const distance = Math.abs(offset - scrollOffset)
      if (distance < closestDistance) {
        closestDistance = distance
        activeLineIndex = index
      }
    })
  }

  useEffect(() => {
    if (!animatedScales.length) return

    animatedScales.forEach((anim, index) => {
      const distance = Math.abs(index - activeLineIndex)

      let targetScale = 1
      if (distance === 1) {
        targetScale = 0.8
      } else if (distance >= 2) {
        targetScale = 0.55
      }

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
    let opacityValue = 0.3

    if (distance === 0) {
      opacityValue = 1
    } else if (distance === 1) {
      opacityValue = 0.65
    } else if (distance === 2) {
      opacityValue = 0.4
    }

    return {
      opacityValue
    }
  }

  useEffect(() => {
    setAnimatedScales(
      lyricLines.map(() => new Animated.Value(1))
    )
  }, [lyricLines])

  const [fontsLoaded] = useFonts({
    LibertineBold: require('@/assets/fonts/LinLibertine_RB.ttf'),
  })

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        ref={scrollViewRef}
        onLayout={({ nativeEvent }) => setViewportHeight(nativeEvent.layout.height)}
        scrollEventThrottle={16}
        onScrollBeginDrag={handleScrollBeginDrag}
        onScroll={handleScroll}
        onScrollEndDrag={handleScrollEndDrag}
        showsVerticalScrollIndicator={false}
        scrollEnabled={true}
        snapToOffsets={hasMeasuredLines ? snapOffsets : undefined}
        snapToStart={false}
        snapToEnd={false}
        decelerationRate="fast"
      >
        <View style={{ height: Math.max(0, anchorY - minLineHeight / 2) }} />
        {lyricLines.map((line, index) => {
          const distanceFromActive = index - activeLineIndex
          const { opacityValue } = getLineStyles(distanceFromActive)
          const isVisible = Math.abs(distanceFromActive) <= 2

          return (
            <View
              key={`${line.time}-${line.content}`}
              accessibilityElementsHidden={!isVisible}
              importantForAccessibility={isVisible ? 'auto' : 'no-hide-descendants'}
              onLayout={({ nativeEvent: { layout } }) => {
                const center = layout.y + layout.height / 2
                setLineCenters((previous) => previous[index] === center
                  ? previous
                  : { ...previous, [index]: center })
              }}
              style={{
                minHeight: minLineHeight,
                paddingVertical: 20,
                justifyContent: 'center',
                opacity: isVisible ? opacityValue : 0
              }}
            >
              <Animated.Text
                numberOfLines={4}
                style={{
                  fontFamily: fontsLoaded ? 'LibertineBold' : undefined,
                  color: colors.text,
                  fontSize: line.content === '♪' ? fontSize.xl * 2 : fontSize.xl,
                  fontWeight: '700',
                  textAlign: 'center',
                  opacity: opacityValue,
                  transform: [{ scale: animatedScales[index] ?? 1 }]
                }}
              >
                {line.content}
              </Animated.Text>
            </View>
          )
        })}
        <View style={{ height: Math.max(0, viewportHeight - anchorY - minLineHeight / 2) }} />
      </ScrollView>
    </View>
    
  )
}


const PlainLyricsView = ({ lyrics }: { lyrics: string }) => {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.lyrics}>
        {lyrics.replace(/\n+/g, (lineBreaks) => `${lineBreaks}\n`)}
      </Text>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center'
  },
  lyrics: {
    textAlign: 'center',
    fontSize: fontSize.lg,
    color: colors.text
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
