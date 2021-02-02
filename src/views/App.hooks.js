/**
 * @flow
 */

import { useState, useEffect } from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Dimensions } from 'react-native';

import { REM_SCALE } from 'TTB/src/theme/palette';
import I18nManager from 'TTB/src/services/i18n';
import AnalyticsManager from 'TTB/src/services/analytics';
import AudioManager from 'TTB/src/services/audio';
import AuthManager from 'TTB/src/services/auth';
import type { UserInfo } from 'TTB/src/services/auth';
import { useStore } from 'TTB/src/model/root';
import { hideLoadingScreen } from 'TTB/src/lib/utils';
import ContentLanguageManager from '../services/contentLanguages';

export function useAppInitialization(): boolean {
  /* State */
  const [initializing, setInitializing] = useState<boolean>(true);

  /* Hooks */
  useEffect(init, []);
  const { uiState, favoritesState, playlistsState, settingsState } = useStore();

  /* Helper Functions */
  function init() {
    Promise.all([
      initializeStyles(),
      I18nManager.init(),
      ContentLanguageManager.init(),
      AuthManager.init(),
      AudioManager.init(),
      AnalyticsManager.init()
    ])
      .then(AuthManager.getUserInfo)
      .then((user: ?UserInfo) => {
        uiState.user = user;
        favoritesState.syncWithCloud();
        playlistsState.syncWithCloud();
        settingsState.syncWithCloud();
        AnalyticsManager.identify(user);
      })
      .finally(() => {
        setInitializing(false);
        hideLoadingScreen();
      });
  }

  function initializeStyles() {
    const { width } = Dimensions.get('window');

    EStyleSheet.build({
      $rem: width / REM_SCALE
    });

    // promise is resolved when styles are built...
    return new Promise<void>(resolve => EStyleSheet.subscribe('build', resolve));
  }

  return initializing;
}
