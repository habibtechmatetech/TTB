/* eslint-disable no-restricted-syntax */
/**
 * @flow
 */

import i18n from 'i18n-js';
import memoize from 'lodash.memoize';
import * as RNLocalize from 'react-native-localize';
import AsyncStorage from '@react-native-community/async-storage';
import { I18nManager as RNI18nManager } from 'react-native';
import * as CountryLanguage from 'country-language';

import { restartApp } from 'TTB/src/lib/utils';

import type { Language } from './i18n.languages';
import { getLanguageList, getLanguage, getLanguageByCode } from './i18n.languages';

/* Functions are not pure as it has the 'restart' side effect :( */
/* There is no way around this, as we have to support RTL languages */
/* See discussion here: https://github.com/facebook/react-native/issues/16215 */
const I18nManager = {};

const DEFAULT_LANGUAGE = 'en';
const LANGUAGE_STORAGE_KEY = 'lang-key';

/* MARK: - Helper functions */

function _ensureLanguageExists(code: string): Language {
  const language = getLanguageByCode(code);
  if (language) {
    return language;
  }
  throw new Error(`Language with code ${code} does not exist`);
}

function _getDefaultLanguage(): Language {
  // the device preferred locales, in order
  const locales = RNLocalize.getLocales();

  // 1. check for a strict language and region match, in order
  for (const locale of locales) {
    const language = getLanguage(locale.languageCode, locale.countryCode, true);
    if (language) {
      return language;
    }
  }

  // 2. check for a non strict language match, in order
  for (const locale of locales) {
    const language = getLanguage(locale.languageCode);
    if (language) {
      return language;
    }
  }

  // 3. Return the fallback language
  return _ensureLanguageExists(DEFAULT_LANGUAGE);
}

async function _getDeviceCountryLanguages(): Promise<Array<Language>> {
  // get configured country on the device
  const countryCode = RNLocalize.getCountry();

  // query its languages
  const countryLanguagesCodes = await _getCountryLanguagesCodes(countryCode);

  const countryLanguages = [];
  for (const languageCodes of countryLanguagesCodes) {
    // fallback to iso639_3 for languages that do not have iso639_1
    const languageCode = languageCodes.iso639_1 ? languageCodes.iso639_1 : languageCodes.iso639_3;

    // search for a match for each language in the country
    const countryLanguage = getLanguage(languageCode, countryCode);
    if (countryLanguage) {
      countryLanguages.push(countryLanguage);
    }
  }

  return countryLanguages;
}

function _getCountryLanguagesCodes(countryCode: string): Promise<any> {
  return new Promise((resolve, reject) => {
    CountryLanguage.getCountryLanguages(countryCode.toUpperCase(), (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

/* Cache translations */
I18nManager.translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key)
);

I18nManager.init = async () => {
  // Load saved language or fallback to the os one
  const language = _getDefaultLanguage();
  // if the OS language direction does not match with the selcted language we have to force it
  if (language.isRTL !== RNI18nManager.isRTL) {
    RNI18nManager.forceRTL(language.isRTL);
    restartApp();
  }

  // clear translation cache
  I18nManager.translate.cache.clear();

  // set i18n-js config
  i18n.translations = { [language.code]: language.loader() };
  i18n.locale = language.code;

  // listen to OS localization changes
  RNLocalize.addEventListener('change', () => {
    I18nManager.saveLanguageAndRestart(_getDefaultLanguage());
  });
};

I18nManager.isRTL = (): boolean => {
  return RNI18nManager.isRTL;
};

I18nManager.currentLanguageCode = (): string => {
  return i18n.locale;
};

I18nManager.languageHasBeenSet = async (): Promise<boolean> => {
  const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
  return storedLanguage != null;
};

I18nManager.saveLanguageAndRestart = (language: Language) => {
  // set the RTL<->LTR conf
  if (language.isRTL !== RNI18nManager.isRTL) {
    RNI18nManager.forceRTL(language.isRTL);
  }

  // save user preference in local storage ...
  AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language.code).then(() => {
    // ... then restart for full effects to take place
    restartApp();
  });
};

I18nManager.getOrderedLanguageList = async (): Promise<Array<Language>> => {
  // first position: current language
  const currentLanguage = _ensureLanguageExists(i18n.locale);

  // second position: languages by region (remove the current language from the list)
  const deviceCountryLanguages = (await _getDeviceCountryLanguages()).filter(
    item => item.code !== currentLanguage.code
  );

  // third position: rest of the languages
  const languageCodes = [currentLanguage, ...deviceCountryLanguages].map(item => item.code);
  const restOfLanguages = getLanguageList().filter(item => !languageCodes.includes(item.code));

  return [currentLanguage, ...deviceCountryLanguages, ...restOfLanguages];
};

// handy alias
export const t = I18nManager.translate;
export type { Language };
export default I18nManager;
