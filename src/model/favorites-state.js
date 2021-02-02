/**
 * @flow
 */

import { observable, computed, action, autorun, runInAction, toJS } from 'mobx';
import { AsyncStorage } from 'react-native';
import PlaylistManager from 'TTB/src/services/playlists';
import _ from 'lodash';
import { uiState } from './ui-state';
import FavoritesManager from '../services/favorites';

export default class FavoritesState {
  @observable favoritesMobX = [];

  @observable tracksMobX = [];

  @computed get favorites() {
    return toJS(this.favoritesMobX);
  }

  @computed get tracks() {
    return toJS(this.tracksMobX);
  }

  constructor() {
    if (uiState.isAuthenticated) {
      this.initializeFavoritesFromCloud();
    } else {
      this.initializeFavoritesFromAsyncStorage();
    }
    autorun(() => {
      this.getTracks(this.favorites);
    });
  }

  @action initializeFavoritesFromAsyncStorage = async () => {
    this.favoritesMobX = await this.getAsyncStorage();
  };

  @action initializeFavoritesFromCloud = async () => {
    this.favoritesMobX = await FavoritesManager.getFavorites();
  };

  @action signOut = () => {
    this.favoritesMobX = [];
  };

  getTracks = async favorites => {
    let tracks = await PlaylistManager.getPlaylistTracks(favorites);
    tracks = tracks.map((item, index) => {
      return {
        ...item,
        order: index
      };
    });
    runInAction(() => {
      this.tracksMobX = tracks;
    });
  };

  isAdded = track => {
    const found = this.favorites.find(element => element.contentId === track.contentId);
    return !!found;
  };

  @action addTrack = track => {
    if (!this.isAdded(track)) {
      const newTrack = {
        id: track.id,
        itemType: track.itemType,
        contentId: track.contentId
      };
      this.favoritesMobX.push(newTrack);
      if (uiState.isAuthenticated) {
        FavoritesManager.addToFavorites(newTrack);
      } else {
        this.setAsyncStorage(this.favorites);
      }
    }
  };

  @action removeTrack = track => {
    if (this.isAdded(track)) {
      const index = this.favorites.findIndex(element => element.contentId === track.contentId);
      const { id } = this.favorites[index];
      this.favoritesMobX.splice(index, 1);
      if (uiState.isAuthenticated) {
        FavoritesManager.removeFromFavorites(id);
      } else {
        this.setAsyncStorage(this.favorites);
      }
    }
  };

  getAsyncStorage = async () => {
    const data = JSON.parse(await AsyncStorage.getItem('favorites'));
    if (data) {
      return data;
    }
    return [];
  };

  setAsyncStorage = async favorites => {
    await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
  };

  removeAsyncStorage = async () => {
    await AsyncStorage.removeItem('favorites');
  };

  @action syncWithCloud = async () => {
    if (!uiState.isAuthenticated) {
      return;
    }
    const onlineFavorites = await FavoritesManager.getFavorites();
    const offlineFavorites = await this.getAsyncStorage();
    const favoritesToUpload = _.differenceBy(
      offlineFavorites,
      onlineFavorites,
      item => item.contentId
    );
    const mergedFavorites = _.uniqBy(
      [...onlineFavorites, ...offlineFavorites],
      item => item.contentId
    );
    // eslint-disable-next-line no-restricted-syntax
    for (const item of favoritesToUpload) {
      // eslint-disable-next-line no-await-in-loop
      await FavoritesManager.addToFavorites(item);
    }
    this.removeAsyncStorage();
    this.favoritesMobX = mergedFavorites;
  };
}

export const favoritesState = new FavoritesState();
