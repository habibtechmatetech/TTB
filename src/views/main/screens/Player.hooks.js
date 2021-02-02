/**
 * @flow
 */

import { useEffect, useRef, useState } from 'react';
import { usePlaybackState, useTrackPlayerEvents } from 'react-native-track-player';
import analytics from '@segment/analytics-react-native';
import AudioManager from 'TTB/src/services/audio';
import NetInfo from '@react-native-community/netinfo';
import { Audio } from '../../../lib/types';
import { useStore } from '../../../model/root';
import GoogleCast from 'react-native-google-cast';

const playbackRateOptions = [
  { key: 0.25, label: '0.25x' },
  { key: 0.5, label: '0.5x' },
  { key: 0.75, label: '0.75x' },
  { key: 1, label: '1x' },
  { key: 1.25, label: '1.25x' },
  { key: 1.5, label: '1.5x' },
  { key: 1.75, label: '1.75x' },
  { key: 2, label: '2x' }
];

export function usePlayerTrack(onQueueEnd: any) {
  const { settingsState } = useStore();
  const [rate, setRate] = useState<number>(1);
  const [track, setTrack] = useState<?Audio>(null);
  const [connectionType, setConnectionType] = useState(null);

  NetInfo.fetch().then(state => {
    setConnectionType(state.type);
  });

  useTrackPlayerEvents(['playback-track-changed'], async () => {
    const trackId = await AudioManager.currentTrackId();
    const currentTrack = await AudioManager.trackPlayer.getTrack(trackId);
    const path = await AudioManager.getPath(currentTrack);
    if (!path && !(connectionType !== 'wifi' && settingsState.settingsProfile.downloadOnlyOnWifi)) {
      const filename = AudioManager.getFilename(currentTrack);
      AudioManager.cacheTrack(currentTrack.url, filename);
    }
    setTrack(currentTrack);
  });

  useTrackPlayerEvents(['playback-queue-ended'], async () => {
    if (onQueueEnd) {
      onQueueEnd();
    }
  });

  useEffect(() => {
    async function _init() {
      await AudioManager.setRate(1);
      await AudioManager.setVolume(0.5);
    }

    _init();
    return () => {
      AudioManager.stop();
    };
  }, []);

  useEffect(() => {
    if (track) {
      analytics.track('Track Played', {
        id: track.id,
        url: track.url,
        title: track.title,
        artist: track.artist,
        itemType: track.itemType,
        contentId: track.contentId
      });
    }
  }, [track]);

  function applyRate(newRate: number = 1.0) {
    setRate(newRate);
    AudioManager.setRate(newRate);
  }

  return {
    rate: {
      options: playbackRateOptions,
      get: rate,
      set: applyRate
    },
    track
  };
}

export function usePlayerControls() {
  const playbackState = usePlaybackState();
  const play = useRef(async () => {
    if ((await AudioManager.getPosition()) >= (await AudioManager.getDuration())) {
      await AudioManager.seekTo(0);
    }
    const trackId = await AudioManager.currentTrackId();
    const currentTrack = await AudioManager.trackPlayer.getTrack(trackId);
    const state = await GoogleCast.getCastState()
      if (state === 'Connected') {
        await GoogleCast.castMedia({
          mediaUrl: currentTrack.originalUrl,
          imageUrl: currentTrack.backgroundImage,
          title: currentTrack.title,
          studio: currentTrack.artist,
          subtitle: currentTrack.subtitle,
          playPosition: 0,
          streamDuration: currentTrack.audioDuration,
        })
      } else {
        await AudioManager.play();
      }

      

  });

 

  return {
    play: play.current,
    pause: AudioManager.pause,
    seekTo: AudioManager.seekTo,
    rewind: AudioManager.rewind30,
    forward: AudioManager.forward30,
    playbackState
  };
}
