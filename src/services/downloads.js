/**
 * @flow
 */

import AsyncStorage from '@react-native-community/async-storage';
import type { DefaultError } from 'TTB/src/lib/connection';
import FileManager from 'TTB/src/lib/fileStorage';
import _ from 'lodash';
import type { Audio } from '../lib/types';
import AudioManager from './audio';

const DownloadsManager = {};

const buildTrack = (track: Audio, index: number): File => {
  const filePath = FileManager.itemFilePath({ itemId: track.itemId });
  return {
    ...track,
    pitchAlgorithm: AudioManager.trackPlayer.PITCH_ALGORITHM_VOICE,
    order: index,
    url: `file:///${encodeURI(filePath)}`,
    originalUrl: track.url,
  };
};

export type AddDownloadError = 'Adding Download Failed' | DefaultError;
DownloadsManager.addDownload = async item => {
  try {
    let downloadsArray = await AsyncStorage.getItem('@downloads');
    if (downloadsArray !== null) {
      downloadsArray = JSON.parse(downloadsArray);
    } else {
      downloadsArray = [];
    }
    downloadsArray.push(item);
    downloadsArray = _.uniqBy(downloadsArray, 'contentId');
    await AsyncStorage.setItem('@downloads', JSON.stringify(downloadsArray));
    return buildTrack(item, downloadsArray.length);
  } catch (e) {
    throw new Error('server-error');
  }
};

export type GetDownloadError = 'Getting Downloads Failed' | DefaultError;
DownloadsManager.getDownloads = async () => {
  try {
    let downloadsArray = await AsyncStorage.getItem('@downloads');
    if (downloadsArray !== null) {
      downloadsArray = JSON.parse(downloadsArray);
    } else {
      downloadsArray = [];
    }
    downloadsArray = downloadsArray.filter(item => item !== null);
    return downloadsArray.map((item, index) => buildTrack(item, index));
  } catch (e) {
    throw new Error('server-error');
  }
};

export type RemoveDownloadError = 'Removing Download Failed' | DefaultError;
DownloadsManager.removeDownload = async contentId => {
  try {
    let downloadsArray = await AsyncStorage.getItem('@downloads');
    if (downloadsArray !== null) {
      downloadsArray = JSON.parse(downloadsArray);
    } else {
      downloadsArray = [];
    }
    const newArray = downloadsArray.filter(download => download.contentId !== contentId);
    await AsyncStorage.setItem('@downloads', JSON.stringify(newArray));
  } catch (e) {
    throw new Error('server-error');
  }
};

export default DownloadsManager;
