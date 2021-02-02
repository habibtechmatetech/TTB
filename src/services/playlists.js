import type { DefaultError } from 'TTB/src/lib/connection';
import { buildRestApiClient } from 'TTB/src/lib/connection';
import _ from 'lodash';
import Constants from 'TTB/src/constants';
import AuthManager from './auth';
import type { Audio, Content, Playlist } from '../lib/types';
import BibleManager, { buildTrack as buildChapterTrack } from './bible';
import TeachingsManager, { buildTrack as buildTeachingTrack } from './teachings';

const apiClient = buildRestApiClient();

const PlaylistManager = {};

export const buildTrack = async (content: Content): ?[Audio] => {
  let data;
  try {
    data = JSON.parse(content.contentId);
    // eslint-disable-next-line no-param-reassign
    content.itemType = content.itemType || data.itemType;
  } catch (e) {
    data = content.contentId;
  }
  const tracks: Array<Audio> = [];

  switch (content.itemType) {
    case 'BIBLE_AUDIO': {
      const chapter = await BibleManager.getChapter(data, data.chapterId);
      const track = await buildChapterTrack(chapter);
      track.id = content.id || track.id;
      tracks.push(track);
      break;
    }
    case 'BIBLE_BOOK': {
      for (let i = 0; i < data.numberOfChapters; i += 1) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const chapter = await BibleManager.getChapter(data, i + 1);
          // eslint-disable-next-line no-await-in-loop
          const track = await buildChapterTrack(chapter);
          // const track = BibleManager.getChapter(data, i + 1)
          //   .then(chapter => buildChapterTrack(chapter))
          //   .catch(e => console.log(e));
          track.id = content.id || track.id;
          tracks.push(track);
        } catch (e) {
          // eslint-disable-next-line no-empty
        }
      }
      break;
      // return Promise.all(tracks);
    }
    default: {
      data = content.contentId;
      try {
        const teaching = await TeachingsManager.getTeaching(data);
        if (teaching) {
          const track = await buildTeachingTrack(teaching);
          track.id = content.id || track.id;
          tracks.push(track);
        }
      } catch (e) {
        // eslint-disable-next-line no-empty
      }
      break;
    }
  }

  return tracks;
};

export type GetPlaylistsError = 'Getting Playlists Failed' | DefaultError;
PlaylistManager.getPlaylists = async (): Playlist => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.get(
      `${Constants.REST_API_URL_USERS}/mobile/profile/playlist`,
      { headers }
    );
    const content: [Playlist] = response.data;
    return content;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type GetPlaylistTracks = 'Getting Playlist Tracks Failed' | DefaultError;
PlaylistManager.getPlaylistTracks = async (items: ?[Content]): [Audio] => {
  try {
    const tracks = await Promise.all(
      items.map(content => {
        return buildTrack(content);
      })
    );
    return _.flatten(tracks);
  } catch (e) {
    throw new Error('server-error');
  }
};

export type CreatePlayListError = 'Creating Playlist Failed' | DefaultError;
PlaylistManager.createPlaylist = async (playlist: Playlist): Playlist => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.post(
      `${Constants.REST_API_URL_USERS}/mobile/profile/playlist/`,
      playlist,
      {
        headers
      }
    );
    return response.data;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type DeletePlaylistError = 'Deleting Playlist Failed' | DefaultError;
PlaylistManager.deletePlaylist = async playlistId => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    await apiClient.delete(
      `${Constants.REST_API_URL_USERS}/mobile/profile/playlist/${playlistId}`,
      { headers }
    );
  } catch (e) {
    throw new Error('server-error');
  }
};

export type DeleteFromPlaylistError = 'Delete From Playlist Failed' | DefaultError;
PlaylistManager.deleteFromPlaylist = async (playlistId, itemId): Playlist => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.delete(
      `${Constants.REST_API_URL_USERS}/mobile/profile/playlist/${playlistId}/${itemId}`,
      {
        headers
      }
    );
    return response.data;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type AddToPlaylistError = 'Add To Playlist Failed' | DefaultError;
PlaylistManager.addToPlaylist = async (playlistId, item): Playlist => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.put(
      `${Constants.REST_API_URL_USERS}/mobile/profile/playlist/${playlistId}`,
      item,
      { headers }
    );
    return response.data;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type UpdatePlayListError = 'Updating Playlist Failed' | DefaultError;
PlaylistManager.updatePlaylist = async (playlistId, newPlaylist): Playlist => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.post(
      `${Constants.REST_API_URL_USERS}/mobile/profile/playlist/${playlistId}`,
      newPlaylist,
      {
        headers
      }
    );
    return response.data;
  } catch (e) {
    throw new Error('server-error');
  }
};

export default PlaylistManager;
