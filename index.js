/**
 * @flow
 */
import 'react-native-gesture-handler';

import { AppRegistry, YellowBox } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { name as appName } from 'TTB/app.json';
import App from 'TTB/src/views/App';
import 'mobx-react-lite/batchingForReactNative';

if (__DEV__) {
  YellowBox.ignoreWarnings([
    // ??
    'Unable to find module for UIManager',

    // https://github.com/Andr3wHur5t/react-native-keyboard-spacer/issues/47
    'Warning: Overriding previous layout animation with new one before the first began'
  ]);
}

AppRegistry.registerComponent(appName, () => App);

// External Audio events
TrackPlayer.registerPlaybackService(() => require('./src/services/remote-audio'));
