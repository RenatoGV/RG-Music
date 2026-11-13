import { registerRootComponent } from 'expo';
import TrackPlayer from './src/helpers/track-player-compat';
import { playbackService } from './src/constants/playbackService';

import App from './App';

TrackPlayer.registerPlaybackService(() => playbackService());

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
