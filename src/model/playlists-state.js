/**
 * @flow
 */

import { computed, observable, action, toJS, runInAction, autorun } from 'mobx';
import { AsyncStorage } from 'react-native';
import _ from 'lodash';
import { t } from 'TTB/src/services/i18n';
import { uiState } from './ui-state';
import PlaylistManager from '../services/playlists';

export default class PlaylistsState {
  @observable playlistsMobX = [];

  @observable playlistNameMobX = '';

  @observable tracksMobX = [];

  @observable editingTracksMobX = [];

  @computed get playlists() {
    const decoratedPlaylists = this.playlistsMobX.map((item, index) => {
      return {
        ...item,
        order: index,
        subtitle:
          item.items.length >= 2
            ? `${item.items.length} ${t('playlists.tracksLabel')}`
            : `${item.items.length} ${t('playlists.trackLabel')}`
      };
    });
    return toJS(decoratedPlaylists);
  }

  @computed get playlistName() {
    return toJS(this.playlistNameMobX);
  }

  @action setPlaylistName = playlistName => {
    this.playlistNameMobX = playlistName;
  };

  getTracks = async (playlists, playlistName) => {
    const playlistIndex = this.findPlaylistIndex(playlistName);
    if (playlistIndex >= 0) {
      try {
        let tracks = await PlaylistManager.getPlaylistTracks(playlists[playlistIndex].items);
        tracks = tracks.map((item, index) => {
          return {
            ...item,
            order: index
          };
        });
        runInAction(() => {
          this.tracksMobX = tracks;
        });
      } catch (e) {
        runInAction(() => {
          this.tracksMobX = [];
        });
      }
    } else {
      runInAction(() => {
        this.tracksMobX = [];
      });
    }
  };

  @computed get tracks() {
    return toJS(this.tracksMobX);
  }

  @computed get editingTracks() {
    return toJS(this.editingTracksMobX);
  }

  @action updateEditingTracks = tracks => {
    this.editingTracksMobX = tracks;
  };

  constructor() {
    if (uiState.isAuthenticated) {
      this.initializePlaylistsFromCloud();
    } else {
      this.initializePlaylistsFromAsyncStorage();
    }
    autorun(() => {
      this.getTracks(this.playlists, this.playlistName);
    });
    autorun(() => {
      this.updateEditingTracks(this.tracks);
    });
  }

  @action initializePlaylistsFromAsyncStorage = async () => {
    this.playlistsMobX = await this.getAsyncStorage();
  };

  @action initializePlaylistsFromCloud = async () => {
    try {
      this.playlistsMobX = await PlaylistManager.getPlaylists();
    } catch {
      this.playlistsMobX = [];
    }
  };

  findPlaylistIndex = playlistName => {
    return this.playlists.findIndex(item => item.name === playlistName);
  };

  findTrackIndex = (playlistName, trackContentId) => {
    const playlistIndex = this.findPlaylistIndex(playlistName);
    if (playlistIndex >= 0) {
      return this.playlists[playlistIndex].items.findIndex(
        item => item.contentId === trackContentId
      );
    }
    return -1;
  };

  isPlaylistAdded = playlistName => {
    return this.findPlaylistIndex(playlistName) >= 0;
  };

  isTrackAdded = (playlistName, trackContentId) => {
    return this.findTrackIndex(playlistName, trackContentId) >= 0;
  };

  @action signOut = () => {
    this.playlistsMobX = [];
    this.playlistNameMobX = '';
    this.tracksMobX = [];
    this.editingTracksMobX = [];
  };

  @action addPlaylist = playlistName => {
    if (!this.isPlaylistAdded(playlistName)) {
      const playlist = {
        name: playlistName,
        items: []
      };
      if (uiState.isAuthenticated) {
        try {
          PlaylistManager.createPlaylist(playlist);
        } catch {
          return;
        }
        this.playlistsMobX.push(playlist);
      } else {
        this.playlistsMobX.push(playlist);
        this.setAsyncStorage(this.playlists);
      }
    }
  };

  @action removePlaylist = playlistName => {
    const playlistIndex = this.findPlaylistIndex(playlistName);
    if (playlistIndex >= 0) {
      if (uiState.isAuthenticated) {
        if (this.playlists[playlistIndex].id) {
          try {
            PlaylistManager.deletePlaylist(this.playlists[playlistIndex].id);
          } catch {
            return;
          }
          this.playlistsMobX.splice(playlistIndex, 1);
        }
      } else {
        this.playlistsMobX.splice(playlistIndex, 1);
        this.setAsyncStorage(this.playlists);
      }
    }
  };

  @action addTrack = (playlistName, { id, itemType, contentId }) => {
    const playlistIndex = this.findPlaylistIndex(playlistName);
    if (playlistIndex >= 0) {
      if (!this.isTrackAdded(playlistName, contentId)) {
        const track = { id, itemType, contentId };
        if (uiState.isAuthenticated) {
          if (this.playlists[playlistIndex].id) {
            try {
              PlaylistManager.addToPlaylist(this.playlists[playlistIndex].id, track);
            } catch {
              return;
            }
            this.playlistsMobX[playlistIndex].items.push(track);
          }
        } else {
          this.playlistsMobX[playlistIndex].items.push(track);
          this.setAsyncStorage(this.playlists);
        }
      }
    }
  };

  @action removeTrack = (playlistName, trackContentId) => {
    const playlistIndex = this.findPlaylistIndex(playlistName);
    if (playlistIndex >= 0) {
      const trackIndex = this.findTrackIndex(playlistName, trackContentId);
      if (trackIndex >= 0) {
        if (uiState.isAuthenticated) {
          if (this.playlists[playlistIndex].id) {
            if (this.playlists[playlistIndex].items[trackIndex].id) {
              try {
                PlaylistManager.deleteFromPlaylist(
                  this.playlists[playlistIndex].id,
                  this.playlists[playlistIndex].items[trackIndex].id
                );
              } catch {
                return;
              }
              this.playlistsMobX[playlistIndex].items.splice(trackIndex, 1);
            }
          }
        } else {
          this.playlistsMobX[playlistIndex].items.splice(trackIndex, 1);
          this.setAsyncStorage(this.playlists);
        }
      }
    }
  };

  findEditingTrackIndex = trackContentId => {
    return this.editingTracks.findIndex(item => item.contentId === trackContentId);
  };

  @action removeEditingTrack = trackContentId => {
    const trackIndex = this.findEditingTrackIndex(trackContentId);
    if (trackIndex >= 0) {
      this.editingTracksMobX.splice(trackIndex, 1);
    }
  };

  @action swapEditingTracks = (fromContentId, toContentId) => {
    const fromTrackIndex = this.findEditingTrackIndex(fromContentId);
    const toTrackIndex = this.findEditingTrackIndex(toContentId);
    if (fromTrackIndex >= 0 && toTrackIndex >= 0) {
      const fromEditingTrackMobX = this.editingTracksMobX[fromTrackIndex];
      const toEditingTrackMobX = this.editingTracksMobX[toTrackIndex];
      this.editingTracksMobX[fromTrackIndex] = toEditingTrackMobX;
      this.editingTracksMobX[toTrackIndex] = fromEditingTrackMobX;
    }
  };

  @action cancelEditingTracks = () => {
    this.updateEditingTracks(this.tracks);
  };

  @action saveEditingTracks = () => {
    const playlistIndex = this.findPlaylistIndex(this.playlistName);
    if (playlistIndex >= 0) {
      const playlist = {
        name: this.playlistName,
        items: this.editingTracks.map(item => {
          return {
            id: item.id,
            itemType: item.itemType,
            contentId: item.contentId
          };
        })
      };
      if (uiState.isAuthenticated) {
        if (this.playlists[playlistIndex].id) {
          try {
            PlaylistManager.updatePlaylist(this.playlists[playlistIndex].id, playlist);
          } catch {
            return;
          }
          this.playlistsMobX[playlistIndex] = playlist;
        }
      } else {
        this.playlistsMobX[playlistIndex] = playlist;
        this.setAsyncStorage(this.playlists);
      }
    }
  };

  getAsyncStorage = async () => {
    const data = JSON.parse(await AsyncStorage.getItem('playlists'));
    if (data) {
      return data;
    }
    return [];
  };

  setAsyncStorage = async playlists => {
    const playlistsToSet = playlists.map(playlist => {
      const { order, subtitle, ...rest } = playlist;
      return rest;
    });
    await AsyncStorage.setItem('playlists', JSON.stringify(playlistsToSet));
  };

  removeAsyncStorage = async () => {
    await AsyncStorage.removeItem('playlists');
  };

  @action syncWithCloud = async () => {
    if (!uiState.isAuthenticated) {
      return;
    }

    let onlinePlaylists = [];
    try {
      onlinePlaylists = await PlaylistManager.getPlaylists();
    } catch {
      return;
    }

    const offlinePlaylists = await this.getAsyncStorage();

    const playlistsToUpdate = [];
    const playlistsToUpload = [];

    offlinePlaylists.map(offlinePlaylist => {
      const onlinePlaylistIndex = onlinePlaylists.findIndex(
        onlinePlaylist => onlinePlaylist.name === offlinePlaylist.name
      );
      if (onlinePlaylistIndex >= 0) {
        const onlinePlaylist = onlinePlaylists[onlinePlaylistIndex];
        playlistsToUpdate.push({
          id: onlinePlaylist.id,
          name: onlinePlaylist.name,
          items: _.uniqBy(
            [...onlinePlaylist.items, ...offlinePlaylist.items],
            track => track.contentId
          )
        });
      } else {
        playlistsToUpload.push(offlinePlaylist);
      }
      return {};
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const playlist of playlistsToUpdate) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await PlaylistManager.updatePlaylist(playlist.id, playlist);
      } catch {
        return;
      }
    }

    // eslint-disable-next-line no-restricted-syntax
    for (const playlist of playlistsToUpload) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await PlaylistManager.createPlaylist(playlist);
      } catch {
        return;
      }
    }

    this.removeAsyncStorage();

    try {
      this.playlistsMobX = await PlaylistManager.getPlaylists();
    } catch {
      this.playlistsMobX = [];
    }
  };
}

export const playlistsState = new PlaylistsState();
