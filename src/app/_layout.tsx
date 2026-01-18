import 'react-native-gesture-handler';

import { useLogTrackPlayerState } from '@/hooks/useLogTrackerPlayerState';
import { useSetupTrackPlayer } from '@/hooks/useSetupTrackPlayer';
import { withLayoutContext } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useRef, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '@/constants/tokens';
import TrackPlayer, { Event, State } from 'react-native-track-player';
import { StoredPlayback, Track } from '@/helpers/types';
import { playbackService } from '@/constants/playbackService';
import { useLibraryStore } from '@/store/library';
import { usePlaylistStore } from '@/store/playlist';
import SplashScreenView from './splashScreen';
import { getPlaybackState } from 'react-native-track-player/lib/src/trackPlayer';
import * as SplashScreen from 'expo-splash-screen';
import { Playlist } from '@/helpers/types';
import { loadData, saveData } from '@/helpers/storage';
import { configureNotificationChannel, requestNotificationPermission } from '@/helpers/notifications';
import { useLyricStore } from '@/store/lyrics';
import { AppState } from 'react-native';

const { Navigator } = createStackNavigator()
const CustomStack = withLayoutContext(Navigator)

SplashScreen.preventAutoHideAsync()

TrackPlayer.registerPlaybackService(() => playbackService)

const App = () => {
	//const initialized = useRef(false)
	const { setTracks } = useLibraryStore()
	const { setPlaylists } = usePlaylistStore()
	const [appReady, setAppReady] = useState(false)
	const [animationFinished, setAnimationFinished] = useState(false)
  	const [skipAnimation, setSkipAnimation] = useState(false)

	useEffect(() => {
    	SplashScreen.hideAsync().catch(() => {})
		configureNotificationChannel()
	}, [])

	useEffect(() => {
		(async () => {
			const playBackState = await getPlaybackState()
			if (playBackState.state !== 'none') {
				SplashScreen.preventAutoHideAsync()
				setSkipAnimation(true)
				setAppReady(true)
			}
		})()
	}, [])

	useEffect(() => {
		// if(initialized.current) return
		// initialized.current = true
		
		const sub = TrackPlayer.addEventListener(
			Event.PlaybackActiveTrackChanged,
			async({ track }) => {
				if(track == null) return

				const queue = await TrackPlayer.getQueue()

				saveData(
					'playback_queue',
					JSON.stringify({
					queue,
					currentTrackIndex: track,
					})
				)

				const position = (await TrackPlayer.getProgress()).position
				saveData('playback_position', position)
				
    			console.log('💾 Queue + track index + position saved')
			}
		)

		return () => sub.remove()
	}, [])

	useEffect(() => {
		const sub = AppState.addEventListener('change', async state => {
			const storedPlaybackQueue = await loadData('playback_queue')

			if(storedPlaybackQueue && storedPlaybackQueue.queue.length > 0) {
				if (state === 'background' || state === 'inactive') {
					try {
					const position = (await TrackPlayer.getProgress()).position
					saveData('playback_position', position)
					console.log('💾 Position guardada por background')
					} catch {}
				}
			}
		})

		return () => sub.remove()
	}, [])

	useEffect(() => {
		let interval: NodeJS.Timeout | null = null

		interval = setInterval(async() => {
			const playBackState = await getPlaybackState()
			if(playBackState.state !== 'playing') return

			const position = (await TrackPlayer.getProgress()).position
			saveData('playback_position', position)
		}, 5000)

		return () => interval && clearInterval(interval)
	}, [])

	const handleTrackPlayerLoaded = useCallback(() => {
		(async() => {
			const storedTracks : Track[] | null = await loadData('tracks')
			const storedPlaylists : Playlist[] | null = await loadData('playlists')
			const storedPlaybackQueue = await loadData('playback_queue')
			const storedPlaybackPosition = await loadData('playback_position')

			setTracks(storedTracks)
			setPlaylists(storedPlaylists)

			if(storedPlaybackQueue && storedPlaybackPosition) {
				try {
					const playback: StoredPlayback =
						typeof storedPlaybackQueue === 'string'
						? JSON.parse(storedPlaybackQueue)
						: storedPlaybackQueue
					
					if(playback.queue?.length > 0) {
						const index =
							typeof playback.currectTrackIndex === 'number'
								? playback.currectTrackIndex
								: 0

						const safeIndex =
							index >= 0 && index < playback.queue.length
								? index
								: 0

						await TrackPlayer.reset()
						await TrackPlayer.add(playback.queue)
						await TrackPlayer.skip(safeIndex)

						if (typeof storedPlaybackPosition === 'number') {
							await new Promise(r => setTimeout(r, 300))
							await TrackPlayer.seekTo(storedPlaybackPosition)
						}
					}
				} catch (e) {
					console.error('Error restoring playback', e)
				}
			}

			await requestNotificationPermission()
			setAppReady(true)
		})()
	}, [])

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