/**
 * @flow
 */

import { observable, computed, action, toJS } from 'mobx';
import { AsyncStorage } from 'react-native';
import AuthManager from 'TTB/src/services/auth';
import { uiState } from './ui-state';

const defaultSettingsProfile = {
  email: '',
  username: '',
  language: 'en_US',
  autoPlay: true,
  downloadOnlyOnWifi: true,
  notifications: []
};

export default class SettingsState {
  @observable settingsProfileMobX = defaultSettingsProfile;

  @computed get settingsProfile() {
    return toJS(this.settingsProfileMobX);
  }

  constructor() {
    if (uiState.isAuthenticated) {
      this.initializeSettingsProfileFromCloud();
    } else {
      this.initializeSettingsProfileFromAsyncStorage();
    }
  }

  @action initializeSettingsProfileFromAsyncStorage = async () => {
    this.settingsProfileMobX = await this.getAsyncStorage();
  };

  @action initializeSettingsProfileFromCloud = async () => {
    try {
      this.favoritesMobX = await AuthManager.getSettingsProfile();
    } catch {
      this.favoritesMobX = defaultSettingsProfile;
    }
  };

  @action signOut = () => {
    this.settingsProfileMobX = defaultSettingsProfile;
  };

  @action updateSettingsProfile = async settingsProfile => {
    if (uiState.isAuthenticated) {
      try {
        await AuthManager.updateSettingsProfile(settingsProfile);
      } catch {
        return;
      }
      this.settingsProfileMobX = settingsProfile;
    } else {
      await this.setAsyncStorage(settingsProfile);
      this.settingsProfileMobX = settingsProfile;
    }
  };

  sendReport = async (subject, body) => {
    await AuthManager.sendReport(subject, body);
  };

  getAsyncStorage = async () => {
    const data = JSON.parse(await AsyncStorage.getItem('settings-profile'));
    if (data) {
      return data;
    }
    return defaultSettingsProfile;
  };

  setAsyncStorage = async settingsProfile => {
    await AsyncStorage.setItem('settings-profile', JSON.stringify(settingsProfile));
  };

  removeAsyncStorage = async () => {
    await AsyncStorage.removeItem('settings-profile');
  };

  @action syncWithCloud = async () => {
    if (!uiState.isAuthenticated) {
      return;
    }
    try {
      this.settingsProfileMobX = await AuthManager.getSettingsProfile();
    } catch {
      return;
    }
    this.removeAsyncStorage();
  };
}

export const settingsState = new SettingsState();
