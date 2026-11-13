//import 'react-native-gesture-handler';
import { useLogTrackPlayerState } from '@/hooks/useLogTrackerPlayerState';
import { useSetupTrackPlayer } from '@/hooks/useSetupTrackPlayer';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack, TransitionPresets } from 'expo-router/js-stack';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '@/constants/tokens';
import { StoredPlayback, Track, Playlist } from '@/helpers/types';
import { useLibraryStore } from '@/store/library';
import { usePlaylistStore } from '@/store/playlist';
import SplashScreenView from './splashScreen';
import TrackPlayer, { getPlaybackState } from '@/helpers/track-player-compat';
import * as SplashScreen from 'expo-splash-screen';
import { loadData, saveData } from '@/helpers/storage';
import { configureNotificationChannel, requestNotificationPermission } from '@/helpers/notifications';
import { useLyricStore } from '@/store/lyrics';

const CustomStack = Stack

void SplashScreen.preventAutoHideAsync().catch(() => {})


const App = () => {
	//const initialized = useRef(false)
	const { setTracks } = useLibraryStore()
	const { setPlaylists } = usePlaylistStore()
	const [appReady, setAppReady] = useState(false)
	const [playerReady, setPlayerReady] = useState(false)
	const [animationFinished, setAnimationFinished] = useState(false)
	const [skipAnimation, setSkipAnimation] = useState(false)

	useEffect(() => {
		void SplashScreen.hideAsync().catch(() => {})
	}, [])

	useEffect(() => {
		if (!appReady || !playerReady) return

		let interval: ReturnType<typeof setInterval> | null = null

		interval = setInterval(async () => {
			try {
				const playBackState = await getPlaybackState()
				if (playBackState.state !== 'playing') return

				const position = TrackPlayer.getProgress().position
				saveData('playback_position', position)
			} catch (error) {
				console.error('Error saving playback position', error)
			}
		}, 5000)

		return () => {
			if (interval !== null) clearInterval(interval)
		}
	}, [appReady, playerReady])

	const handleTrackPlayerLoaded = useCallback(async (isPlayerReady: boolean) => {
		setPlayerReady(isPlayerReady)

		try {
			let hasActivePlayback = false
			if (isPlayerReady) {
				try {
					const playbackState = await getPlaybackState()
					hasActivePlayback = playbackState.state !== 'none'
				} catch (error) {
					console.error('Error checking playback state', error)
				}
			}
			setSkipAnimation(hasActivePlayback)

			const storedTracks = loadData<Track[]>('tracks')
			const storedPlaylists = loadData<Playlist[]>('playlists')
			const storedPlaybackQueue = loadData<StoredPlayback | string>('playback_queue')
			const storedPlaybackPosition = loadData<number>('playback_position')

			setTracks(storedTracks)
			setPlaylists(storedPlaylists)

			if (isPlayerReady && storedPlaybackQueue) {
				try {
					const playback = (typeof storedPlaybackQueue === 'string'
						? JSON.parse(storedPlaybackQueue)
						: storedPlaybackQueue) as StoredPlayback

					if (playback.queue?.length > 0) {
						const index =
							typeof playback.currentTrackIndex === 'number'
								? playback.currentTrackIndex
								: 0

						const safeIndex =
							index >= 0 && index < playback.queue.length
								? index
								: 0

						TrackPlayer.reset()
						TrackPlayer.add(playback.queue)
						TrackPlayer.skip(safeIndex)

						if (typeof storedPlaybackPosition === 'number' && storedPlaybackPosition > 0) {
							await new Promise(r => setTimeout(r, 300))
							TrackPlayer.seekTo(storedPlaybackPosition)
						}
					}
				} catch (e) {
					console.error('Error restoring playback', e)
				}
			}

			await configureNotificationChannel()
			await requestNotificationPermission()
		} catch (error) {
			console.error('Error loading app data', error)
		} finally {
			setAppReady(true)
		}
	}, [setPlaylists, setTracks])

	useSetupTrackPlayer({
		onLoad: handleTrackPlayerLoaded
	})
	
	useLogTrackPlayerState()

	/*useEffect(() => {
		if(!isLoading) {
			SplashScreen.hideAsync()
			requestNotificationPermission()
		}
	}, [isLoading])*/
  const showApp = appReady && (skipAnimation || animationFinished)

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
	
	return (
		<CustomStack>
			<CustomStack.Screen name='(tabs)' options={{headerShown: false}} />
			<CustomStack.Screen name='player' options={{
				...TransitionPresets.ModalSlideFromBottomIOS,
				gestureEnabled: !showLyrics,
				presentation: 'card',
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
