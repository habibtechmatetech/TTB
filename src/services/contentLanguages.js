/**
 * @flow
 */

import type { DefaultError } from 'TTB/src/lib/connection';
import { buildRestApiClient } from 'TTB/src/lib/connection';
import Constants from 'TTB/src/constants';
import AsyncStorage from '@react-native-community/async-storage';
import { restartApp } from 'TTB/src/lib/utils';
import * as RNLocalize from 'react-native-localize';

const LANGUAGE_STORAGE_KEY = 'content-lang-key';

const apiClient = buildRestApiClient();

const ContentLanguageManager = {};

ContentLanguageManager.init = async () => {
  ContentLanguageManager._currentLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
};

export type GetLanguagesError = 'Getting Languages Failed' | DefaultError;
ContentLanguageManager.getLanguages = async () => {
  try {
    const response = await apiClient.get(
      `${Constants.REST_API_URL_CONTENT}/localization/languages`
    );
    const languages = response.data;
    return languages;
  } catch (e) {
    throw new Error('server-error');
  }
};

ContentLanguageManager.getCurrentLanguage = (): string => {
  let languageTag;
  if (ContentLanguageManager._currentLanguage) {
    languageTag = ContentLanguageManager._currentLanguage;
  } else {
    const locales = RNLocalize.getLocales();
    if (locales.length > 0) {
      languageTag = locales[0].languageTag.replace('-', '_').toLowerCase();
    }
  }

  return languageTag || 'en_US';
};

ContentLanguageManager.setLanguage = async languageTag => {
  ContentLanguageManager._currentLanguage = languageTag;
  await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, languageTag);
  restartApp();
};

export default ContentLanguageManager;
