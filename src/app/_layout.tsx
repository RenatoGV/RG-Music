import 'react-native-gesture-handler';

import { useLogTrackPlayerState } from '@/hooks/useLogTrackerPlayerState';
import { useSetupTrackPlayer } from '@/hooks/useSetupTrackPlayer';
import { withLayoutContext } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { colors } from '@/constants/tokens';
import TrackPlayer, { Track } from 'react-native-track-player';
import { playbackService } from '@/constants/playbackService';
import { useLibraryStore } from '@/store/library';
import { usePlaylistStore } from '@/store/playlist';
import SplashScreenView from './splashScreen';
import { getPlaybackState } from 'react-native-track-player/lib/src/trackPlayer';
import * as SplashScreen from 'expo-splash-screen';
import { Playlist } from '@/helpers/types';
import { loadData } from '@/helpers/storage';
import { requestNotificationPermission } from '@/helpers/notifications';
import { useLyricStore } from '@/store/lyrics';

const { Navigator } = createStackNavigator()
const CustomStack = withLayoutContext(Navigator)

SplashScreen.preventAutoHideAsync()

TrackPlayer.registerPlaybackService(() => playbackService)

const App = () => {
	const { setTracks } = useLibraryStore()
	const { setPlaylists } = usePlaylistStore()
	const [isLoading, setIsLoading] = useState(true)

	useEffect(() => {
		(async() => {
			const playBackState = await getPlaybackState()
			if(playBackState.state !== 'none') setIsLoading(false)
		})()
	}, [])

	const handleTrackPlayerLoaded = useCallback(() => {
		(async() => {
			const storedTracks : Track[] | null = await loadData('tracks')
			const storedPlaylists : Playlist[] | null = await loadData('playlists')

			setTracks(storedTracks)
			setPlaylists(storedPlaylists)

			setTimeout(() => setIsLoading(false), 3000)
			await SplashScreen.hideAsync()
		})()
	}, [])

	useSetupTrackPlayer({
		onLoad: handleTrackPlayerLoaded
	})
	
	useLogTrackPlayerState()

	useEffect(() => {
		if(!isLoading) {
			SplashScreen.hideAsync()
			requestNotificationPermission()
		}
	}, [isLoading])

	return(
		<SafeAreaProvider>
			{
				isLoading ? <SplashScreenView />
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
				gestureEnabled: true,
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
		</CustomStack>
	)
}

export default App