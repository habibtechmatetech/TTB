/**
 * @flow
 */

import { useNavigation } from 'react-navigation-hooks';
import { useState } from 'react';
import analytics from '@segment/analytics-react-native';
import { showErrorNotification } from 'TTB/src/lib/utils';
import AnalyticsManager from 'TTB/src/services/analytics';
import AuthManager from 'TTB/src/services/auth';
import { useStore } from 'TTB/src/model/root';
import { t } from 'TTB/src/services/i18n';
import { GoogleSignin, statusCodes } from '@react-native-community/google-signin';
import Constants from '../../../constants';

GoogleSignin.configure({
  webClientId: Constants.GOOGLE_SERVER_KEY,
  offlineAccess: true
});

/* MARK: - Type Definitions */

export type GoogleHook = {|
  submit: {
    sending: boolean,
    doSend: () => Promise<void>
  }
|};

export function useGoogleSignin() {
  /* State */
  const [sending, setSending] = useState<boolean>(false);

  /* Hooks */
  const { uiState, favoritesState, playlistsState, settingsState } = useStore();
  const { navigate } = useNavigation();

  /* Functions */
  async function doSend() {
    setSending(true);
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signIn();
      const tokens = await GoogleSignin.getTokens();
      const user = await AuthManager.signInWithProvider('google', tokens.accessToken);
      if (user) {
        uiState.user = user;
        favoritesState.syncWithCloud();
        playlistsState.syncWithCloud();
        settingsState.syncWithCloud();
        AnalyticsManager.identify(user);
        analytics.track('User login');
        navigate('Bible');
      }
    } catch (e) {
      if (e === 'invalid-token') {
        showErrorNotification(t('signIn.notifications.invalidCredentials'));
      } else if (e.code === statusCodes.IN_PROGRESS) {
        showErrorNotification(t('signIn.notifications.inProgress'));
      } else if (e.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        showErrorNotification(t('signIn.notifications.notAvailable'));
      } else if (e.code === statusCodes.SIGN_IN_CANCELLED) {
        // do nothing
      } else {
        showErrorNotification(`${t('alert.google.loginError')}: ${e}`);
      }
    }
    setSending(false);
  }

  /* Public API */
  return {
    submit: {
      sending,
      doSend
    }
  };
}
