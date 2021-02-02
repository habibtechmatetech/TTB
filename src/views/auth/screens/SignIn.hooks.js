/**
 * @flow
 */

import { useNavigation } from 'react-navigation-hooks';
import { useState } from 'react';
import analytics from '@segment/analytics-react-native';
import {
  showErrorNotification,
  hideNotification,
  validEmail,
  stringNotEmpty
} from 'TTB/src/lib/utils';
import type { SignInError } from 'TTB/src/services/auth';
import AnalyticsManager from 'TTB/src/services/analytics';
import AuthManager from 'TTB/src/services/auth';
import { t } from 'TTB/src/services/i18n';
import { useStore } from 'TTB/src/model/root';

/* MARK: - Type Definitions */

export type EmailSignInHook = {|
  fields: {
    email: string,
    setEmail: string => void,
    password: string,
    setPassword: string => void
  },
  submit: {
    sending: boolean,
    inputIsValid: () => boolean,
    doSend: () => Promise<void>
  }
|};

/* MARK: - Hook */

export function useEmailSignIn(): EmailSignInHook {
  /* State */
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  /* Hooks */
  const { uiState, favoritesState, playlistsState, settingsState } = useStore();
  const { navigate } = useNavigation();

  /* Functions */
  function inputIsValid(): boolean {
    return !sending && stringNotEmpty(email) && stringNotEmpty(password);
  }

  async function doSend() {
    if (!inputIsValid()) {
      return;
    }

    if (!validEmail(email)) {
      showErrorNotification(t('forgotPassword.notifications.invalidEmailError'));
      return;
    }

    hideNotification();
    setSending(true);
    try {
      const user = await AuthManager.signInWithEmail(email.trim(), password.trim());
      uiState.user = user;
      favoritesState.syncWithCloud();
      playlistsState.syncWithCloud();
      settingsState.syncWithCloud();
      AnalyticsManager.identify(user);
      analytics.track('User login');
      navigate('Bible');
    } catch (e) {
      const error: SignInError = e.message;
      switch (error) {
        case 'invalid-credentials':
          showErrorNotification(t('signIn.notifications.invalidCredentials'));
          break;
        case 'server-error':
          showErrorNotification(t('uiControls.notification.serverError'));
          break;
        default:
          break;
      }

      setSending(false);
    }
  }

  /* Public API */
  return {
    fields: {
      email,
      setEmail,
      password,
      setPassword
    },
    submit: {
      sending,
      inputIsValid,
      doSend
    }
  };
}
