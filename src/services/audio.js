/**
 * @flow
 */

import TrackPlayer from 'react-native-track-player';
import type { Audio } from 'TTB/src/lib/types';
import _ from 'lodash';
import * as RNFS from 'react-native-fs';

const AudioManager = {};

AudioManager.getFilename = track => {
  let fileExtension;
  if (track.file && track.file.mimeType) {
    fileExtension = track.file.mimeType;
  } else {
    const fileName = track.url.split('/').pop();
    fileExtension = fileName.split('.').pop();
    if (fileExtension === fileName) {
      fileExtension = 'mp4';
    }
  }
  const filename = `${track.id}.${fileExtension}`;
  return filename;
};

AudioManager.getPath = async track => {
  const filename = AudioManager.getFilename(track);
  const downloadsPath = `${RNFS.DocumentDirectoryPath}/downloads/${filename}`;
  const cachePath = `${RNFS.DocumentDirectoryPath}/cache/${filename}`;
  if (await RNFS.exists(downloadsPath)) {
    return `file://${downloadsPath}`;
  }
  if (await RNFS.exists(cachePath)) {
    return `file://${cachePath}`;
  }
  return null;
};

AudioManager.updateTracksUrl = async tracks => {
  const newTracks = [];
  // eslint-disable-next-line no-restricted-syntax
  for (const track of tracks) {
    // eslint-disable-next-line no-await-in-loop
    const path = await AudioManager.getPath(track);
    if (path) {
      newTracks.push({ ...track, url: path });
    } else {
      newTracks.push({ ...track });
    }
  }
  return newTracks;
};

AudioManager.cacheTrack = async (url, filename) => {
  const cacheFolderExists = await RNFS.exists(`${RNFS.DocumentDirectoryPath}/cache`);
  if (!cacheFolderExists) {
    await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/cache`);
  }
  await RNFS.downloadFile({
    fromUrl: url,
    toFile: `${RNFS.DocumentDirectoryPath}/cache/${filename}`
  });
};

/* MARK: - Constants */

/* MARK: - Services */

AudioManager.init = async () => {
  await TrackPlayer.setupPlayer({
    waitForBuffer: true
  });
  TrackPlayer.updateOptions({
    capabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_SKIP_TO_NEXT,
      TrackPlayer.CAPABILITY_SKIP_TO_PREVIOUS,
      TrackPlayer.CAPABILITY_STOP,
      TrackPlayer.CAPABILITY_SEEK_TO
    ],
    compactCapabilities: [
      TrackPlayer.CAPABILITY_PLAY,
      TrackPlayer.CAPABILITY_PAUSE,
      TrackPlayer.CAPABILITY_STOP
    ]
  });
};

AudioManager.trackPlayer = TrackPlayer;
AudioManager.currentTrackId = TrackPlayer.getCurrentTrack;
AudioManager.getState = TrackPlayer.getState;
AudioManager.pause = TrackPlayer.pause;
AudioManager.play = TrackPlayer.play;
AudioManager.stop = TrackPlayer.stop;
AudioManager.skipToNext = TrackPlayer.skipToNext;
AudioManager.skipToPrevious = TrackPlayer.skipToPrevious;
AudioManager.seekTo = TrackPlayer.seekTo;
AudioManager.setVolume = TrackPlayer.setVolume;
AudioManager.getVolume = TrackPlayer.getVolume;
AudioManager.setRate = TrackPlayer.setRate;
AudioManager.getRate = TrackPlayer.getRate;
AudioManager.addEventListener = TrackPlayer.addEventListener;
AudioManager.getDuration = TrackPlayer.getDuration;
AudioManager.getPosition = TrackPlayer.getPosition;

AudioManager.rewind30 = async () => {
  const position = await TrackPlayer.getPosition();
  const newPosition = position - 30 < 0 ? 0 : position - 30;

  await TrackPlayer.seekTo(newPosition);
};

AudioManager.forward30 = async () => {
  const position = await TrackPlayer.getPosition();
  const duration = await TrackPlayer.getDuration();
  const newPosition = position + 30 > duration ? duration : position + 30;

  await TrackPlayer.seekTo(newPosition);
};

AudioManager.addTrack = async (track: Audio) => {
  await TrackPlayer.add(track);
};

AudioManager.setTracks = async (tracks: [Audio]) => {
  await TrackPlayer.reset();
  const newTracks = await AudioManager.updateTracksUrl(tracks);
  await TrackPlayer.add(newTracks);
};

AudioManager.skipToTrack = async (id: string) => {
  await TrackPlayer.skip(id);
  await TrackPlayer.play();
};

AudioManager.shuffle = async (tracks: [Audio]) => {
  await TrackPlayer.removeUpcomingTracks();
  await TrackPlayer.add(_.shuffle(tracks));
};

AudioManager.unShuffle = async (tracks: [Audio]) => {
  await TrackPlayer.removeUpcomingTracks();
  await TrackPlayer.add(tracks);
};

export default AudioManager;
