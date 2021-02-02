/**
 * @flow
 */

import { useNavigation } from 'react-navigation-hooks';
import { useState } from 'react';

import {
  showSuccessNotification,
  showErrorNotification,
  hideNotification,
  validEmail,
  stringNotEmpty
} from 'TTB/src/lib/utils';
import type { ResetPasswordError } from 'TTB/src/services/auth';
import AuthManager from 'TTB/src/services/auth';
import { t } from 'TTB/src/services/i18n';

/* MARK: - Type Definitions */

export type ForgotPasswordHook = {|
  fields: {
    email: string,
    setEmail: string => void
  },
  submit: {
    sending: boolean,
    inputIsValid: () => boolean,
    doSend: () => Promise<void>
  }
|};

/* MARK: - Hook */

export function useForgotPassword(): ForgotPasswordHook {
  /* State */
  const [email, setEmail] = useState<string>('');
  const [sending, setSending] = useState<boolean>(false);

  /* Hooks */
  const { goBack } = useNavigation();

  /* Functions */
  function inputIsValid(): boolean {
    return !sending && stringNotEmpty(email);
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
      await AuthManager.resetPassword(email.trim());
      goBack();
      showSuccessNotification(t('forgotPassword.notifications.success'));
    } catch (e) {
      const error: ResetPasswordError = e.message;
      switch (error) {
        case 'email-not-found':
          showErrorNotification(t('forgotPassword.notifications.emailNotFoundError'));
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
      setEmail
    },
    submit: {
      sending,
      inputIsValid,
      doSend
    }
  };
}
