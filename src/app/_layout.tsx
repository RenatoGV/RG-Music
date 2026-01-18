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
			Event.PlaybackState,
			async({ state }) => {
				if(state === State.Paused) {
					try {
						const queue = await TrackPlayer.getQueue()
						const currectTrackIndex = await TrackPlayer.getActiveTrackIndex()
						const position = await TrackPlayer.getProgress().then((progress) => progress.position)

						if(currectTrackIndex == null) return

						const dataToSave = {
							queue,
							currectTrackIndex,
							position
						}

						saveData('playback', JSON.stringify(dataToSave))
						console.log('💾 Playback saved')
					} catch (e) {
						console.error('Error guardando playback', e)
					}
				}
			}
		)

		return () => sub.remove()
	}, [])

	const handleTrackPlayerLoaded = useCallback(() => {
		(async() => {
			const storedTracks : Track[] | null = await loadData('tracks')
			const storedPlaylists : Playlist[] | null = await loadData('playlists')
			const storedPlayback = await loadData('playback')

			setTracks(storedTracks)
			setPlaylists(storedPlaylists)

			if(storedPlayback) {
				try {
					const playback: StoredPlayback =
						typeof storedPlayback === 'string'
						? JSON.parse(storedPlayback)
						: storedPlayback
					
					if(playback.queue?.length > 0) {
						await TrackPlayer.reset()
						await TrackPlayer.add(playback.queue)
						await TrackPlayer.skip(playback.currectTrackIndex)
						await TrackPlayer.seekTo(playback.position)
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