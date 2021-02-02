/**
 * @flow
 */

import { useState } from 'react';
import {
  showErrorNotification,
  hideNotification,
  validEmail,
  stringNotEmpty
} from 'TTB/src/lib/utils';
import type { SignUpError } from 'TTB/src/services/auth';
import AuthManager from 'TTB/src/services/auth';
import { t } from 'TTB/src/services/i18n';

/* MARK: - Type Definitions */

export type EmailSignUpHook = {|
  fields: {
    email: string,
    setEmail: string => void,
    password: string,
    setPassword: string => void,
    isPrivate: boolean,
    setIsPrivate: boolean => void
  },
  modals: {
    privateModalVisibility: boolean,
    setPrivateModalVisibility: boolean => void,
    uniqueEmailModalVisibility: boolean,
    setUniqueEmailModalVisibility: boolean => void
  },
  actions: {
    togglePrivacy: () => void
  },
  submit: {
    sending: boolean,
    inputIsValid: () => boolean,
    doSend: () => Promise<void>
  }
|};

/* MARK: - Hook */

export function useEmailSignUp(): EmailSignUpHook {
  /* State */
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isPrivate, setIsPrivate] = useState<boolean>(false);
  const [privateModalVisibility, setPrivateModalVisibility] = useState<boolean>(false);
  const [uniqueEmailModalVisibility, setUniqueEmailModalVisibility] = useState<boolean>(false);
  const [successModalVisibility, setSuccessModalVisibility] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);

  /* Helper Functions */
  function _validPassword(passwordVal: string) {
    const options = {
      lowerCase: 1,
      upperCase: 1,
      numeric: 1,
      symbol: 1
    };

    if (!stringNotEmpty(passwordVal) || passwordVal.length < 3) {
      return false;
    }

    const lowercaseCount = (passwordVal.match(/[a-z]/g) || []).length;
    const upperCaseCount = (passwordVal.match(/[A-Z]/g) || []).length;
    const numericCount = (passwordVal.match(/[0-9]/g) || []).length;
    const symbolCount = (passwordVal.match(/[^a-zA-Z0-9]/g) || []).length;
    const meetsLowercase = lowercaseCount >= options.lowerCase;
    const meetsUppercase = upperCaseCount >= options.upperCase;
    const meetsNumeric = numericCount >= options.numeric;
    const meetsSymbol = symbolCount >= options.symbol;
    const isValidPassword = (meetsNumeric || meetsSymbol) && meetsUppercase && meetsLowercase;
    return isValidPassword;
  }

  /* Functions */
  function togglePrivacy() {
    if (isPrivate) {
      setIsPrivate(false);
    } else {
      setPrivateModalVisibility(true);
    }
  }

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

    if (!_validPassword(password)) {
      showErrorNotification(t('signUp.notifications.invalidPassword'));
      return;
    }

    hideNotification();
    setSending(true);
    try {
      await AuthManager.signUpWithEmail(email.trim(), password.trim(), isPrivate);
      setSuccessModalVisibility(true);
    } catch (e) {
      const error: SignUpError = e.message;
      switch (error) {
        case 'email-exists':
          setUniqueEmailModalVisibility(true);
          break;
        case 'server-error':
          showErrorNotification(t('uiControls.notification.serverError'));
          break;
        default:
          break;
      }
    }
    setSending(false);
  }

  /* Public API */
  return {
    fields: {
      email,
      setEmail,
      password,
      setPassword,
      isPrivate,
      setIsPrivate
    },
    modals: {
      privateModalVisibility,
      setPrivateModalVisibility,
      uniqueEmailModalVisibility,
      setUniqueEmailModalVisibility,
      successModalVisibility,
      setSuccessModalVisibility
    },
    actions: {
      togglePrivacy
    },
    submit: {
      sending,
      inputIsValid,
      doSend
    }
  };
}
