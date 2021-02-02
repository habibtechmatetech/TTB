/**
 * @flow
 */

import * as React from 'react';
import { useEffect, useState } from 'react';
import { Keyboard, Platform } from 'react-native';
import RNRestart from 'react-native-restart';
import SplashScreen from 'react-native-splash-screen';
import { hideMessage, showMessage } from 'react-native-flash-message';
import i18n from 'i18n-js';

import Theme from 'TTB/src/theme/Theme';

/* MARK: - Helper functions */

export function formatDate(date: Date) {
  return i18n.toTime('date.formats.long', date);
}

export function formatTime(time: number) {
  // Hours, minutes and seconds
  const hrs = Math.floor(time / 3600);
  const mins = Math.floor((time % 3600) / 60);
  const secs = Math.floor(time % 60);

  // Output like "1:01" or "4:03:59" or "123:03:59"
  let ret = '';

  if (hrs > 0) {
    ret += `${hrs}:${mins < 10 ? '0' : ''}`;
  }

  ret += `${mins}:${secs < 10 ? '0' : ''}`;
  ret += `${secs}`;
  return ret;
}

export function stringNotEmpty(str: string) {
  return str != null && str !== undefined && str.trim() !== '';
}

export function validEmail(str: string) {
  // eslint-disable-next-line no-useless-escape
  const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return stringNotEmpty(str) && re.test(str);
}

export function sleep(milliseconds: number) {
  return new Promise<void>(resolve => setTimeout(resolve, milliseconds));
}

/* MARK: - UI Utils */

export function hideNotification() {
  hideMessage();
}

export function showSuccessNotification(text: string) {
  showMessage({
    message: text,
    icon: 'success',
    backgroundColor: Theme.colors.successNotification,
    titleStyle: { ...Theme.palette.h6, color: Theme.colors.textNotification }
  });
}

export function showErrorNotification(text: string) {
  showMessage({
    message: text,
    icon: 'danger',
    backgroundColor: Theme.colors.errorNotification,
    titleStyle: { ...Theme.palette.h6, color: Theme.colors.textNotification }
  });
}

export function restartApp() {
  RNRestart.Restart();
}

export function hideLoadingScreen() {
  SplashScreen.hide();
}

export function useKeyboardListener(): boolean {
  /* State */
  const [keyboardShown, setKeyboardShown] = useState<boolean>(false);

  /* Effects */
  useEffect(Keyboard.dismiss, []);
  useEffect(() => {
    const showEventName = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow';
    const keyboardDidShowListener = Keyboard.addListener(showEventName, () =>
      setKeyboardShown(true)
    );

    const hideEventName = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide';
    const keyboardDidHideListener = Keyboard.addListener(hideEventName, () =>
      setKeyboardShown(false)
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);

  return keyboardShown;
}

export const KeyboardHidden = ({ children }: { children: React.Node }) => {
  const keyboardShown = useKeyboardListener();

  return keyboardShown ? <></> : children;
};
