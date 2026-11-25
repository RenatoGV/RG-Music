import { useCallback, useEffect, useRef, useState } from 'react'
import { useLocalSearchParams, useRouter } from 'expo-router'
import {
  ActivityIndicator,
  AppState,
  FlatList,
  Image,
  Keyboard,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { FontAwesome6, Ionicons, MaterialIcons } from '@expo/vector-icons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Bar } from 'react-native-progress'
import { errorCodes, isErrorWithCode, pickDirectory } from '@react-native-documents/picker'
import { colors, fontSize, screenPadding } from '@/constants/tokens'
import { unknownTrackImageUri } from '@/constants/images'
import { defaultStyles } from '@/styles'
import { GradientButton } from '@/components/common/GradientButton'
import { EmptyState } from '@/components/common/EmptyState'
import { ScreenHeader } from '@/components/common/ScreenHeader'
import { LiquidGlassSurface } from '@/components/glass/LiquidGlassSurface'
import { useTabContentBottomPadding } from '@/hooks/useTabContentBottomPadding'
import { importDownloadedTrack } from '@/helpers/import'
import { loadData, saveData } from '@/helpers/storage'
import { showToast } from '@/helpers/toast'
import {
  addDownloadProgressListener,
  cancelAudioDownload,
  downloadAudio,
  finishDownloadService,
  getYouTubePlaylistUrl,
  getYouTubeVideoId,
  resolveYouTubePlaylist,
  resolveYouTubeMusic,
  searchYouTubeMusic,
  startDownloadService,
  type MusicPlaylistResult,
  type MusicSearchResult,
} from '@/services/musicDownloadService'

type DownloadState = 'idle' | 'downloading' | 'importing'

const formatDuration = (seconds: number) => {
  if (!Number.isFinite(seconds) || seconds <= 0) return '--:--'
  const minutes = Math.floor(seconds / 60)
  return `${minutes}:${String(Math.floor(seconds % 60)).padStart(2, '0')}`
}

const MusicSearchScreen = () => {
  const { videoId: sharedVideoId, playlistUrl: sharedPlaylistUrl, share } = useLocalSearchParams<{ videoId?: string; playlistUrl?: string; share?: string }>()
  const router = useRouter()
  const handledShare = useRef<string | undefined>(undefined)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<MusicSearchResult[]>([])
  const [searching, setSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchError, setSearchError] = useState('')
  const [selectedTrack, setSelectedTrack] = useState<MusicSearchResult | null>(null)
  const [selectedPlaylist, setSelectedPlaylist] = useState<MusicPlaylistResult | null>(null)
  const [fileName, setFileName] = useState('')
  const [author, setAuthor] = useState('')
  const [album, setAlbum] = useState('')
  const [quality, setQuality] = useState(192)
  const [downloadState, setDownloadState] = useState<DownloadState>('idle')
  const [progress, setProgress] = useState(0)
  const [downloadStatus, setDownloadStatus] = useState('')
  const [cancelling, setCancelling] = useState(false)
  const [downloadError, setDownloadError] = useState('')
  const [folderUri, setFolderUri] = useState<string | null>(() => loadData<string>('selectedAlbum'))
  const tabContentBottomPadding = useTabContentBottomPadding()
  const safeInsets = useSafeAreaInsets()
  const searchVersion = useRef(0)
  const downloadInFlight = useRef(false)
  const cancelRequested = useRef(false)
  const minimized = useRef(false)
  const currentTrackLabel = useRef('')
  const [hidden, setHidden] = useState(false)
  const busy = downloadState !== 'idle'

  const openDownloadOptions = useCallback((track: MusicSearchResult) => {
    setSelectedPlaylist(null)
    setSelectedTrack(track)
    setFileName(track.title)
    setAuthor(track.artist === 'Desconocido' ? '' : track.artist)
    setAlbum(track.album ?? '')
    setFolderUri(loadData<string>('selectedAlbum'))
    setDownloadError('')
  }, [])

  const search = useCallback(async (value = query, videoId = getYouTubeVideoId(value)) => {
    const cleanQuery = value.trim()
    if (!cleanQuery || downloadInFlight.current) return
    const playlistUrl = getYouTubePlaylistUrl(cleanQuery)
    const version = ++searchVersion.current
    Keyboard.dismiss()
    setHasSearched(true)
    setResults([])
    setSearching(true)
    setSearchError('')
    try {
      const playlist = playlistUrl ? await resolveYouTubePlaylist(playlistUrl) : null
      const found = playlist ? playlist.tracks : videoId ? [await resolveYouTubeMusic(videoId)] : await searchYouTubeMusic(cleanQuery)
      if (version === searchVersion.current) {
        setResults(found)
        if (playlist) {
          setSelectedTrack(null)
          setSelectedPlaylist(playlist)
          setFolderUri(loadData<string>('selectedAlbum'))
          setDownloadError('')
        } else if (videoId) openDownloadOptions(found[0])
      }
    } catch (error) {
      if (version === searchVersion.current) {
        console.warn('Error al buscar en YouTube', error)
        setSearchError(getReadableError(error, videoId ? 'No se pudo abrir el enlace de YouTube.' : 'No se pudo buscar en YouTube.'))
        setResults([])
      }
    } finally {
      if (version === searchVersion.current) setSearching(false)
    }
  }, [query, openDownloadOptions])

  const handleQueryChange = (value: string) => {
    setQuery(value)
    setHasSearched(false)
    setResults([])
    setSearchError('')
  }

  useEffect(() => {
    if ((!sharedVideoId && !sharedPlaylistUrl) || !share || handledShare.current === share || busy) return
    handledShare.current = share
    const url = sharedPlaylistUrl ?? `https://www.youtube.com/watch?v=${sharedVideoId}`
    setSelectedTrack(null)
    setSelectedPlaylist(null)
    setQuery(url)
    router.setParams({ videoId: undefined, playlistUrl: undefined, share: undefined })
    void search(url, sharedVideoId)
  }, [busy, router, search, share, sharedPlaylistUrl, sharedVideoId])

  useEffect(() => {
    if (Platform.OS !== 'android') return
    const subscription = addDownloadProgressListener(({ progress: nextProgress, message }) => {
      setProgress(Math.min(1, Math.max(0, nextProgress)))
      setDownloadStatus([currentTrackLabel.current, message || `Descargando · ${Math.round(nextProgress * 100)}%`].filter(Boolean).join(' · '))
    })
    return () => subscription.remove()
  }, [])

  const closeDownloadOptions = () => {
    if (busy) {
      minimized.current = true
      showToast('Descargando en segundo plano')
      setHidden(true)
      return
    }
    Keyboard.dismiss()
    setSelectedTrack(null)
    setSelectedPlaylist(null)
  }

  const chooseFolder = async () => {
    const { uri } = await pickDirectory({ requestLongTermAccess: true })
    if (!uri) return null
    saveData('selectedAlbum', uri)
    setFolderUri(uri)
    return uri
  }

  const startDownload = async () => {
    const playlist = selectedPlaylist
    const tracks = playlist?.tracks ?? (selectedTrack ? [selectedTrack] : [])
    if (tracks.length === 0 || downloadInFlight.current) return
    downloadInFlight.current = true
    cancelRequested.current = false
    minimized.current = false
    const targetFolder = loadData<string>('selectedAlbum')
    let savedCount = 0
    let failedCount = 0
    let serviceStarted = false
    let wasCancelled = false
    let failureMessage = ''
    try {
      if (!targetFolder) {
        setFolderUri(null)
        return
      }
      Keyboard.dismiss()

      setDownloadError('')
      setProgress(0)
      setDownloadStatus('Preparando la descarga…')
      setDownloadState('downloading')
      startDownloadService(`Descargando ${playlist?.title ?? fileName}`)
      serviceStarted = true

      for (const [index, track] of tracks.entries()) {
        if (cancelRequested.current) { wasCancelled = true; break }
        if (playlist) {
          currentTrackLabel.current = `Pista ${index + 1}/${tracks.length} · ${track.title}`
          setDownloadStatus(currentTrackLabel.current)
          setProgress(0)
        }
        try {
          const result = await downloadAudio(
            track.url,
            targetFolder,
            playlist ? track.title : fileName,
            playlist ? 192 : quality,
            playlist ? '' : author.trim(),
            playlist ? '' : album.trim(),
            !!playlist,
          )
          setDownloadState('importing')
          try {
            await importDownloadedTrack(result.uri, result.fileName, playlist ? track.artist : author.trim())
          } catch (error) {
            console.warn('[IMPORT] No se pudo actualizar la biblioteca tras guardar el MP3', error)
          }
          savedCount += 1
          setDownloadState('downloading')
        } catch (error) {
          if (!playlist) throw error
          if (/cancel|destroy|interrupt/i.test(String(error))) {
            wasCancelled = true
            break
          }
          failedCount += 1
          console.warn(`[PLAYLIST] No se pudo descargar ${track.title}`, error)
        }
      }

      if (playlist) {
        const message = `${savedCount} de ${tracks.length} canciones guardadas${failedCount ? ` · ${failedCount} fallidas` : ''}`
        if (savedCount > 0) {
          showToast(message)
          setSelectedPlaylist(null)
        } else if (wasCancelled) {
          setDownloadError('Descarga cancelada.')
        } else {
          throw new Error('No se pudo guardar ninguna canción de la playlist.')
        }
      } else {
        showToast(`Canción guardada: ${fileName}`)
        setSelectedTrack(null)
      }
    } catch (error) {
      console.warn('[DOWNLOAD] Falló la descarga o preparación del MP3', error)
      const message = getReadableError(error, 'No se pudo descargar la canción.')
      wasCancelled = cancelRequested.current || /cancelad/i.test(message)
      failureMessage = message
      setDownloadError(wasCancelled ? 'Descarga cancelada.' : message)
      if (!wasCancelled) showToast('No se pudo descargar la canción')
    } finally {
      if (serviceStarted) {
        const message = playlist
          ? `${savedCount} de ${tracks.length} canciones guardadas`
          : failureMessage || (savedCount > 0 ? 'La canción se agregó a la biblioteca' : 'La descarga terminó')
        try {
          finishDownloadService(
            wasCancelled ? 'Descarga cancelada' : failedCount || failureMessage ? 'Descarga con errores' : playlist ? 'Playlist descargada' : 'Canción descargada',
            message,
            AppState.currentState !== 'active' || minimized.current,
          )
        } catch (error) {
          console.warn('[DOWNLOAD] No se pudo cerrar el servicio de notificación', error)
        }
      }
      downloadInFlight.current = false
      currentTrackLabel.current = ''
      setHidden(false)
      setCancelling(false)
      setDownloadState('idle')
    }
  }

  const cancelDownload = () => {
    cancelRequested.current = true
    setCancelling(true)
    cancelAudioDownload()
  }

  const selectLibraryFolder = async () => {
    try {
      Keyboard.dismiss()
      await chooseFolder()
    } catch (error) {
      if (isErrorWithCode(error) && error.code === errorCodes.OPERATION_CANCELED) return
      showToast(getReadableError(error, 'No se pudo seleccionar la carpeta'))
    }
  }

  return (
    <View style={defaultStyles.container}>
      <View style={styles.backgroundGlow} />
      <ScreenHeader title="Descubrir música" subtitle="Busca y guarda en tu dispositivo" topInset={safeInsets.top} />

      <View style={styles.content}>
        {busy && hidden && (
          <Pressable accessibilityRole="button" onPress={() => { setHidden(false); minimized.current = false }} style={styles.progressCard}>
            <Text style={styles.progressTitle}>Ver descarga en curso</Text>
          </Pressable>
        )}
        <View style={styles.searchRow}>
          <Ionicons name="search" size={20} color={colors.textMuted} />
          <TextInput
            value={query}
            onChangeText={handleQueryChange}
            onSubmitEditing={() => void search()}
            placeholder="Canción, artista o enlace"
            placeholderTextColor={colors.placeholder}
            selectionColor={colors.primary}
            returnKeyType="search"
            accessibilityLabel="Buscar canción o artista en YouTube Music"
            style={styles.searchInput}
          />
          {query.length > 0 && (
            <Pressable accessibilityLabel="Borrar búsqueda" onPress={() => setQuery('')} hitSlop={10}>
              <Ionicons name="close" size={19} color={colors.textMuted} />
            </Pressable>
          )}
          <GradientButton
            onPress={() => void search()}
            accessibilityRole="button"
            accessibilityLabel="Buscar"
            style={styles.searchButton}
            disabled={busy || searching || !query.trim()}
          >
            {searching ? <ActivityIndicator size="small" color={colors.background} /> : <Ionicons name="arrow-forward" size={19} color={colors.background} />}
          </GradientButton>
        </View>

        {searching && results.length === 0 ? (
          <View style={styles.centerState}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.stateText}>Buscando canciones…</Text>
          </View>
        ) : searchError ? (
          <View style={styles.centerState}>
            <Ionicons name="cloud-offline-outline" size={34} color={colors.textMuted} />
            <Text style={styles.stateTitle}>No se pudo completar la búsqueda</Text>
            <Text style={styles.stateText}>{searchError}</Text>
          </View>
        ) : results.length === 0 ? (
          <EmptyState
            title={hasSearched ? 'No se encontraron canciones' : 'Encuentra tu próxima canción'}
            description={hasSearched ? 'Prueba con otro título, artista o enlace de YouTube.' : 'Busca por título o artista. Los resultados vienen de YouTube.'}
            style={styles.centerState}
          />
        ) : (
          <FlatList
            showsVerticalScrollIndicator={false}
            data={results}
            keyExtractor={(item, index) => `${item.id}-${index}`}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={[styles.resultsList, { paddingBottom: tabContentBottomPadding }]}
            ListHeaderComponent={<Text style={styles.resultsHeading}>Resultados · {results.length}</Text>}
            renderItem={({ item }) => (
              <Pressable disabled={busy} onPress={() => openDownloadOptions(item)} style={styles.resultRow} accessibilityRole="button">
                {item.artwork ? (
                  <Image source={{ uri: item.artwork }} style={styles.artwork} />
                ) : (
                  <View style={[styles.artwork, styles.artworkFallback]}><Ionicons name="musical-note" size={22} color={colors.textMuted} /></View>
                )}
                <View style={styles.resultInfo}>
                  <Text numberOfLines={1} style={styles.trackTitle}>{item.title}</Text>
                  <Text numberOfLines={1} style={styles.artistLine}>{item.artist} · {formatDuration(item.duration)}</Text>
                </View>
                <View style={styles.downloadIcon}><MaterialIcons name="download" size={19} color={colors.primary} /></View>
              </Pressable>
            )}
          />
        )}
      </View>

      <Modal visible={!hidden && (selectedTrack !== null || selectedPlaylist !== null)} transparent statusBarTranslucent navigationBarTranslucent animationType="fade" onRequestClose={closeDownloadOptions}>
        <View style={[styles.modalOverlay, { paddingTop: safeInsets.top + 10, paddingBottom: safeInsets.bottom + 10 }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeDownloadOptions} />
          <LiquidGlassSurface style={styles.optionsCard} borderRadius={24} intensity={32}>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.optionsContent} bounces={false}>
              <View style={styles.modalTitleRow}>
                {!selectedPlaylist && selectedTrack?.artwork ? <Image source={{ uri: selectedTrack.artwork }} style={styles.modalArtwork} /> : null}
                <View style={styles.resultInfo}>
                  <Text numberOfLines={1} style={styles.trackTitle}>{selectedPlaylist?.title ?? selectedTrack?.title}</Text>
                  <Text numberOfLines={1} style={styles.artistLine}>{selectedPlaylist ? `${selectedPlaylist.tracks.length} canciones` : selectedTrack?.artist}</Text>
                </View>
                <Pressable accessibilityRole="button" accessibilityLabel="Cerrar" hitSlop={10} onPress={closeDownloadOptions} style={[styles.closeButton, busy && styles.disabledButton]}>
                  <FontAwesome6 name="xmark" size={14} color={colors.text} />
                </Pressable>
              </View>

              {selectedPlaylist ? (
                <ScrollView style={styles.playlistTracks} nestedScrollEnabled showsVerticalScrollIndicator={false}>
                  {selectedPlaylist.tracks.map((track, index) => (
                    <View key={`${track.id}-${index}`} style={styles.playlistTrackRow}>
                      <Image
                        source={{ uri: track.artwork || unknownTrackImageUri }}
                        style={styles.playlistTrackArtwork}
                      />
                      <View style={styles.resultInfo}>
                        <Text numberOfLines={1} style={styles.trackTitle}>{track.title}</Text>
                        <Text numberOfLines={1} style={styles.artistLine}>{track.artist} · {formatDuration(track.duration)}</Text>
                      </View>
                    </View>
                  ))}
                </ScrollView>
              ) : (
                <>
                  <Text style={styles.inputLabel}>Nombre del archivo</Text>
                  <View style={styles.fileNameInputWrap}>
                    <TextInput
                      value={fileName}
                      onChangeText={setFileName}
                      placeholder="Nombre de la canción"
                      placeholderTextColor={colors.placeholder}
                      editable={!busy}
                      selectTextOnFocus
                      accessibilityLabel="Nombre del archivo MP3"
                      style={styles.fileNameInput}
                    />
                    <Text style={styles.extension}>.mp3</Text>
                  </View>

                  <Text style={styles.inputLabel}>Álbum</Text>
                  <View style={styles.fileNameInputWrap}>
                    <TextInput value={album} onChangeText={setAlbum} placeholder="Opcional" placeholderTextColor={colors.placeholder} accessibilityLabel="Álbum" editable={!busy} style={styles.fileNameInput} />
                  </View>

                  <Text style={styles.inputLabel}>Autor</Text>
                  <View style={styles.fileNameInputWrap}>
                    <TextInput value={author} onChangeText={setAuthor} placeholder="Opcional" placeholderTextColor={colors.placeholder} accessibilityLabel="Autor" editable={!busy} style={styles.fileNameInput} />
                  </View>
                  <Text style={styles.inputLabel}>Calidad del audio</Text>
                  <View style={styles.qualityRow}>
                    {[128, 192, 320].map((bitrate) => (
                      <Pressable key={bitrate} disabled={busy} onPress={() => setQuality(bitrate)} style={[styles.qualityOption, quality === bitrate && styles.qualityOptionActive]}>
                        <Text style={[styles.qualityText, quality === bitrate && styles.qualityTextActive]}>{bitrate} kbps</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              )}
              <Text style={styles.metadataHint}>
                <FontAwesome6 name="circle-info" size={15} color={colors.textMuted} />  {selectedPlaylist ? 'Se conservarán los metadatos y la portada disponibles de cada video.' : 'Se incluirán los metadatos y la portada disponibles.'}
              </Text>
              <Text style={[styles.metadataHint, { color: colors.primary }]}>{folderUri ? 'Guardando en la carpeta de la biblioteca' : 'Debes escoger la carpeta de la biblioteca de la aplicación.'}</Text>
              {downloadError ? <Text style={styles.errorText}>{downloadError}</Text> : null}

              {busy ? (
                <View style={styles.progressCard}>
                  <View style={styles.progressHeader}>
                    <Text accessibilityLiveRegion="polite" style={styles.progressTitle}>
                      {downloadState === 'importing' ? 'Añadiendo a la biblioteca…' : cancelling ? 'Cancelando…' : downloadStatus || `Descargando · ${Math.round(progress * 100)}%`}
                    </Text>
                    {downloadState === 'downloading' && !cancelling && (
                      <Pressable accessibilityRole="button" accessibilityLabel="Cancelar descarga" onPress={cancelDownload} style={styles.cancelButton}>
                        <Ionicons name="close" size={17} color={colors.text} />
                      </Pressable>
                    )}
                  </View>
                  <Bar progress={downloadState === 'importing' ? 1 : progress} width={null} height={4} color={colors.primary} borderWidth={0} unfilledColor="rgba(255,255,255,0.12)" />
                </View>
              ) : (
                <GradientButton onPress={() => void (folderUri ? startDownload() : selectLibraryFolder())} disabled={Platform.OS !== 'android' || (!!folderUri && !selectedPlaylist && !fileName.trim())} style={[styles.primaryButton, (Platform.OS !== 'android' || (!!folderUri && !selectedPlaylist && !fileName.trim())) && styles.disabledButton]}>
                  <MaterialIcons name="download" size={19} color={colors.background} />
                  <Text style={styles.primaryButtonText}>{folderUri ? selectedPlaylist ? 'Descargar Playlist' : 'Descargar MP3' : 'Elegir carpeta de la biblioteca'}</Text>
                </GradientButton>
              )}
              {Platform.OS !== 'android' ? <Text style={styles.errorText}>Esta función está disponible solo en Android.</Text> : null}
            </ScrollView>
          </LiquidGlassSurface>
        </View>
      </Modal>
    </View>
  )
}

const getReadableError = (error: unknown, fallback: string) => {
  const message = error instanceof Error ? error.message : typeof error === 'string' ? error : ''
  if (/failed to initialize|ExceptionInInitializerError|no se pudo preparar el extractor/i.test(message)) return 'No se pudo iniciar el motor de búsqueda en el dispositivo.'
  if (/cancel|destroy|interrupt/i.test(message)) return 'Descarga cancelada.'
  if (/no space left|enospc|not enough space/i.test(message)) return 'No hay espacio suficiente en el dispositivo para preparar este MP3.'
  if (/out of memory|cannot allocate memory|killed/i.test(message)) return 'El dispositivo no tiene memoria suficiente para preparar este audio. Cierra otras aplicaciones e inténtalo de nuevo.'
  if (/ffmpeg.*not found|ffprobe.*not found/i.test(message)) return 'No se encontró el conversor de audio en el dispositivo.'
  if (/postprocessing:|sin generar el MP3/i.test(message)) {
    const detail = /postprocessing:\s*([^\r\n]+)/i.exec(message)?.[1]?.trim()
    return detail ? `No se pudo preparar el MP3: ${detail.slice(0, 180)}` : 'Se obtuvo el audio, pero falló la conversión o preparación del MP3.'
  }
  if (/requested format is not available|no video formats found|only images are available|gvs po token|proof.of.origin token/i.test(message)) {
    return 'YouTube no entregó un formato de audio compatible para este resultado. Prueba otra versión de la canción.'
  }
  if (/javascript|challenge solving failed|no usable challenge solver|BGUtils|runtime Deno/i.test(message)) {
    return 'No se pudo preparar la conexión con YouTube. Comprueba tu conexión e inténtalo de nuevo.'
  }
  if (/video unavailable|not available in your country|sign in|not embeddable|page needs to be reloaded|http error 403/i.test(message)) {
    return 'YouTube no permite descargar este resultado en este momento. Prueba otra versión de la canción.'
  }
  if (/securityexception|permission denial|archivo de destino|carpeta seleccionada|carpeta de música/i.test(message)) {
    return 'No se pudo guardar el archivo. Vuelve a elegir la carpeta de música.'
  }
  return fallback
}

const styles = StyleSheet.create({
	backgroundGlow: {
		position: 'absolute',
		top: -120,
		left: -100,
		width: 360,
		height: 360,
		borderRadius: 180,
		backgroundColor: 'rgba(22,126,75,0.22)',
	},
	content: {
    flex: 1,
    paddingHorizontal: screenPadding.horizontal
  },
	searchRow: {
		minHeight: 56,
		paddingLeft: 17,
		paddingRight: 7,
		flexDirection: 'row',
		alignItems: 'center',
		columnGap: 11,
		borderRadius: 18,
		backgroundColor: 'rgba(255,255,255,0.075)',
		borderWidth: 1,
		borderColor: 'rgba(255,255,255,0.09)',
	},
	searchInput: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.sm,
    paddingVertical: 12
  },
	searchButton: {
		width: 40,
		height: 40,
		borderRadius: 14,
		alignItems: 'center',
		justifyContent: 'center',
	},
	resultsList: {
    paddingBottom: 12
  },
	resultsHeading: {
		color: colors.textMuted,
		fontSize: fontSize.xs,
		fontWeight: '600',
		marginTop: 17,
		marginBottom: 6,
		letterSpacing: 0.4,
	},
	resultRow: {
		minHeight: 72,
		flexDirection: 'row',
		alignItems: 'center',
		columnGap: 13,
		paddingVertical: 9,
	},
	artwork: {
    width: 52,
    height: 52,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.08)'
  },
	artworkFallback: {
    justifyContent: 'center',
    alignItems: 'center'
  },
	resultInfo: {
    flex: 1,
    minWidth: 0
  },
	trackTitle: {
    color: colors.text,
    fontSize: fontSize.sm,
    fontWeight: '600'
  },
	artistLine: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    marginTop: 4
  },
	downloadIcon: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: 'rgba(32,216,96,0.10)',
		alignItems: 'center',
		justifyContent: 'center',
	},
	centerState: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 18,
		paddingBottom: 45,
	},
	stateTitle: {
		color: colors.text,
		fontSize: fontSize.sm,
		fontWeight: '600',
		textAlign: 'center',
		marginTop: 14,
	},
	stateText: {
		color: colors.textMuted,
		fontSize: fontSize.xs,
		lineHeight: 20,
		textAlign: 'center',
		marginTop: 8,
	},
	progressCard: {
    padding: 15,
  },
	progressHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
	progressTitle: {
    flex: 1,
    color: colors.text,
    fontSize: fontSize.xs,
    fontWeight: '600'
  },
	cancelButton: {
		width: 30,
		height: 30,
		borderRadius: 15,
		backgroundColor: 'rgba(255,255,255,0.1)',
		alignItems: 'center',
		justifyContent: 'center',
		marginLeft: 12,
	},
	modalOverlay: {
		flex: 1,
		backgroundColor: 'rgba(0,0,0,0.70)',
		justifyContent: 'center',
		alignItems: 'center',
		paddingHorizontal: 20,
	},
	optionsCard: {
    flexShrink: 1,
    width: '100%',
    maxWidth: 460,
    backgroundColor: 'rgba(21,25,28,0.98)',
  },
  optionsContent: {
		paddingHorizontal: 20,
		paddingTop: 20,
		paddingBottom: 24,
	},
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)'
  },
	modalTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    marginBottom: 20
  },
	modalArtwork: {
    width: 48,
    height: 48,
    borderRadius: 10
  },
	playlistTracks: {
    maxHeight: 280,
    marginBottom: 16,
  },
	playlistTrackRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    columnGap: 12,
    paddingVertical: 5,
  },
	playlistTrackArtwork: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
	inputLabel: {
		color: colors.textMuted,
		fontSize: fontSize.xs,
		fontWeight: '600',
		marginBottom: 8,
		marginTop: 4,
	},
	fileNameInputWrap: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 13,
		backgroundColor: 'rgba(255,255,255,0.08)',
		paddingHorizontal: 13,
	},
	fileNameInput: {
    flex: 1,
    minHeight: 48,
    color: colors.text,
    fontSize: fontSize.sm
  },
	extension: {
    color: colors.textMuted,
    fontSize: fontSize.xs
  },
	qualityRow: {
    flexDirection: 'row',
    columnGap: 8,
    marginBottom: 14
  },
	qualityOption: {
		flex: 1,
		paddingVertical: 11,
		alignItems: 'center',
		borderRadius: 11,
		backgroundColor: 'rgba(255,255,255,0.07)',
		borderWidth: 1,
		borderColor: 'transparent',
	},
	qualityOptionActive: {
		backgroundColor: 'rgba(32,216,96,0.12)',
		borderColor: 'rgba(32,216,96,0.55)',
	},
	qualityText: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    fontWeight: '600'
  },
	qualityTextActive: {
    color: colors.primary
  },
	metadataHint: {
    color: colors.textMuted,
    fontSize: fontSize.xs,
    lineHeight: 17,
    marginBottom: 14,
  },
	errorText: {
    color: '#ff7b7b',
    fontSize: fontSize.xs,
    lineHeight: 18,
    marginBottom: 12
  },
	primaryButton: {
		minHeight: 50,
		borderRadius: 16,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		columnGap: 9,
	},
	disabledButton: {
    opacity: 0.55
  },
	primaryButtonText: {
    color: colors.background,
    fontSize: fontSize.sm,
    fontWeight: '700'
  },
})

export default MusicSearchScreen
