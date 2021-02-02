/**
 * @flow
 */

// eslint-disable-next-line no-unused-vars
import { useState, useEffect, useRef } from 'react';
import type { Language } from 'TTB/src/services/i18n';
import { useStore } from 'TTB/src/model/root';
import { restartApp } from 'TTB/src/lib/utils';
import ContentLanguageManager from '../../../services/contentLanguages';

/* MARK: - Type Definitions */

export type UILanguage = Language & {|
  isSelected: boolean
|};
export type LanguageHook = {|
  getLanguageList: () => Array<UILanguage>,
  selectLanguage: (language: UILanguage) => void,
  languageSelectionIsValid: () => boolean,
  filterLanguageList: (filter: string) => void,
  applySelectedLanguage: () => void,
  applyingChanges: boolean,
  initializing: boolean
|};

/* MARK: - Hook */

export function useLanguageList(): LanguageHook {
  /* Local variables */
  const allLanguages = useRef<Array<Language>>([]);

  /* State */
  const { settingsState } = useStore();
  const [languageList, setLanguageList] = useState<Array<Language>>([]);
  const [selectedLanguage, setSelectedLanguage] = useState<?Language>(null);
  const [applyingChanges, setApplyingChanges] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);

  /* Effects */
  useEffect(() => {
    async function _init() {
      setInitializing(true);
      const newLanguages = await ContentLanguageManager.getLanguages();
      allLanguages.current = newLanguages;
      setLanguageList(newLanguages);
      setInitializing(false);
    }
    _init();
  }, []);

  /* Functions */
  function getLanguageList(): Array<UILanguage> {
    // augment language object with selection state
    return languageList.map(
      language =>
        (({
          isSelected: selectedLanguage && selectedLanguage.alpha2 === language.alpha2,
          ...language
        }: any): UILanguage)
    );
  }

  function selectLanguage(language: UILanguage) {
    setSelectedLanguage(language);
  }

  function filterLanguageList(filter: string) {
    // if filter is empty reset the language list
    if (!filter || !filter.trim()) {
      setLanguageList(allLanguages.current);
    } else {
      const filteredLanguages = allLanguages.current.filter(language =>
        language.name.toLowerCase().match(filter.toLowerCase())
      );
      setLanguageList(filteredLanguages);
    }

    // reset selection...
    setSelectedLanguage(null);
  }

  async function applySelectedLanguage() {
    if (languageSelectionIsValid()) {
      setApplyingChanges(true);
      await settingsState.updateSettingsProfile({
        ...settingsState.settingsProfile,
        language: selectedLanguage.alpha2
      });
      restartApp();
    }
  }

  function languageSelectionIsValid(): boolean {
    return selectedLanguage != null;
  }

  /* Public API */
  return {
    getLanguageList,
    selectLanguage,
    filterLanguageList,
    applySelectedLanguage,
    applyingChanges,
    languageSelectionIsValid,
    initializing
  };
}
