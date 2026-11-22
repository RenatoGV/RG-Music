import { useLogTrackPlayerState } from '@/hooks/useLogTrackerPlayerState';
import { useSetupTrackPlayer } from '@/hooks/useSetupTrackPlayer';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Stack, TransitionPresets } from 'expo-router/js-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '@/constants/tokens';
import { useLibraryStore } from '@/store/library';
import { usePlaylistStore } from '@/store/playlist';
import SplashScreenView from './splashScreen';
import { getPlaybackState } from '@/helpers/track-player-compat';
import * as SplashScreen from 'expo-splash-screen';
import { configureNotificationChannel, requestNotificationPermission } from '@/helpers/notifications';
import { useLyricStore } from '@/store/lyrics';
import { restorePlaybackSession } from '@/services/playbackSessionService';
import { loadPersistedAppData } from '@/services/appDataService';
import { usePersistPlaybackPosition } from '@/hooks/usePersistPlaybackPosition';
import { Platform } from 'react-native';
import { useRootNavigationState, useRouter } from 'expo-router';
import { getYouTubeVideoId, subscribeToSharedMusic } from '@/services/musicDownloadService';
import { showToast } from '@/helpers/toast';

const CustomStack = Stack

void SplashScreen.preventAutoHideAsync().catch(() => {})

const App = () => {
	const notificationsStarted = useRef(false)
	const { setTracks } = useLibraryStore()
	const { setPlaylists } = usePlaylistStore()
	const [appReady, setAppReady] = useState(false)
	const [playerReady, setPlayerReady] = useState(false)
	const [animationFinished, setAnimationFinished] = useState(false)
	const [skipAnimation, setSkipAnimation] = useState(false)

	useEffect(() => {
		void SplashScreen.hideAsync().catch(() => {})
	}, [])

	usePersistPlaybackPosition(appReady && playerReady)

	const handleTrackPlayerLoaded = useCallback(async (isPlayerReady: boolean) => {
		setPlayerReady(isPlayerReady)

		try {
			let hasActivePlayback = false
			if (isPlayerReady) {
				try {
					const playbackState = getPlaybackState()
					hasActivePlayback = playbackState.state !== 'none'
				} catch (error) {
					console.error('Error checking playback state', error)
				}
			}
			setSkipAnimation(hasActivePlayback)

			const { tracks, playlists } = loadPersistedAppData()

			setTracks(tracks)
			setPlaylists(playlists)

			if (isPlayerReady) {
				try {
					await restorePlaybackSession()
				} catch (e) {
					console.error('Error restoring playback', e)
				}
			}
		} catch (error) {
			console.error('Error loading app data', error)
		} finally {
			setAppReady(true)
		}
	}, [setPlaylists, setTracks])

	const showApp = appReady && (skipAnimation || animationFinished)

	useEffect(() => {
		if(!showApp || notificationsStarted.current) return

		notificationsStarted.current = true;

		void (async () => {
			try {
				await configureNotificationChannel()
				await requestNotificationPermission()
			} catch (error) {
				console.error('Error configuring notifications', error)
			}
		})()
	}, [showApp])

	useSetupTrackPlayer({
		onLoad: handleTrackPlayerLoaded,
	})
	
	useLogTrackPlayerState()

	return(
		<SafeAreaProvider>
			{
				!showApp ? (
						<SplashScreenView onFinish={() => setAnimationFinished(true)} />
					)
				:	<GestureHandlerRootView style={{flex: 1}}>
						<RootNavigation />
						<StatusBar style='light' />
					</GestureHandlerRootView>
			}
		</SafeAreaProvider>
	)
}

const RootNavigation = () => {
	const { showLyrics } = useLyricStore()
	const { top } = useSafeAreaInsets()
	const router = useRouter()
	const routerRef = useRef(router)
	routerRef.current = router
	const navigationReady = Boolean(useRootNavigationState()?.key)
	const shareSequence = useRef(0)

	useEffect(() => {
		if (Platform.OS !== 'android' || !navigationReady) return
		return subscribeToSharedMusic((text) => {
			const videoId = getYouTubeVideoId(text)
			if (!videoId) {
				showToast('Comparte un enlace de una canción o un video de YouTube.')
				return
			}
			routerRef.current.navigate({ pathname: '/download', params: { videoId, share: String(++shareSequence.current) } })
		})
	}, [navigationReady])
	
	return (
		<CustomStack>
			<CustomStack.Screen name='(tabs)' options={{headerShown: false}} />
			<CustomStack.Screen name='player' options={{
				...TransitionPresets.ModalSlideFromBottomIOS,
				gestureEnabled: Platform.OS === 'ios' || !showLyrics,
				gestureResponseDistance: Platform.OS === 'ios' && showLyrics ? top + 48 : undefined,
				presentation: Platform.OS === 'android' ? 'transparentModal' : 'card',
				animationDuration: 400,
				headerShown: false,
			}} />
			<CustomStack.Screen name='(modals)/addToPlaylist' options={{
				...TransitionPresets.ModalSlideFromBottomIOS,
				presentation: 'modal',
				headerStyle: {
					backgroundColor: colors.background
				},
				headerTitle: 'Agregar a Playlist',
				headerTitleStyle: {
					color: colors.primary
				},
				gestureEnabled: false,
				headerTintColor: colors.primary
			}} />
			<CustomStack.Screen name='(modals)/addTracksToPlaylist' options={{
				...TransitionPresets.ModalSlideFromBottomIOS,
				presentation: 'modal',
				headerStyle: {
					backgroundColor: colors.background
				},
				headerTitle: 'Agregar Canciones',
				headerTitleStyle: {
					color: colors.primary
				},
				gestureEnabled: false,
				headerTintColor: colors.primary
			}} />
			<CustomStack.Screen name='notification.click' options={{ headerShown: false }} />
		</CustomStack>
	)
}

export default App
