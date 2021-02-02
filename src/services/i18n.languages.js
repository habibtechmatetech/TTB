/*
 * @flow
 */

import languages from 'TTB/assets/i18n/languages';

export type Language = {|
  code: string,
  label: string,
  isRTL: boolean,
  loader: Function
|};

/* Extend the language object with its code */
function _get(key: string): ?Language {
  return languages[key] ? { ...languages[key], code: key } : null;
}

/* If strict is set it REQUIRES match of language and region */
export function getLanguage(language: string, region: ?string, strict: boolean = false): ?Language {
  const regionUpperCase = region ? region.toUpperCase() : '';

  const match = _get(`${language.toLowerCase()}-${regionUpperCase}`);
  return match || (strict ? null : _get(language.toLowerCase()));
}

export function getLanguageByCode(code: string): ?Language {
  return _get(code);
}

export function getLanguageList(): Array<Language> {
  // $FlowExpectedError: Flow can not know there are no maybe types in the array
  return Object.keys(languages).map(key => _get(key));
}
