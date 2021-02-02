/**
 * @flow
 */

import { LoginManager, AccessToken } from 'react-native-fbsdk';
import { useNavigation } from 'react-navigation-hooks';
import { useState } from 'react';
import analytics from '@segment/analytics-react-native';
import { showErrorNotification } from 'TTB/src/lib/utils';
import AnalyticsManager from 'TTB/src/services/analytics';
import AuthManager from 'TTB/src/services/auth';
import { useStore } from 'TTB/src/model/root';
import { t } from 'TTB/src/services/i18n';

/* MARK: - Type Definitions */
export type FacebookHook = {|
  submit: {
    sending: boolean,
    doSend: () => Promise<void>
  }
|};

export function useFacebookSignin() {
  /* State */
  const [sending, setSending] = useState<boolean>(false);

  /* Hooks */
  const { uiState, favoritesState, playlistsState, settingsState } = useStore();
  const { navigate } = useNavigation();

  /* Functions */
  async function doSend() {
    setSending(true);
    try {
      const result = await LoginManager.logInWithPermissions(['email, public_profile']);
      if (!result.isCancelled) {
        const data = await AccessToken.getCurrentAccessToken();
        const token = data.accessToken.toString();
        const user = await AuthManager.signInWithProvider('facebook', token);
        if (user) {
          uiState.user = user;
          favoritesState.syncWithCloud();
          playlistsState.syncWithCloud();
          settingsState.syncWithCloud();
          AnalyticsManager.identify(user);
          analytics.track('User login');
          navigate('Bible');
        }
      }
    } catch (e) {
      if (e === 'invalid-token') {
        showErrorNotification(t('signIn.notifications.invalidCredentials'));
      } else {
        showErrorNotification(`${t('alert.facebook.loginError')}: ${e}`);
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
