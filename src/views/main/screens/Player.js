/**
 * @flow
 */

import React, { useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Observer } from 'mobx-react';
import { Image, Text, TouchableOpacity, View, Alert } from 'react-native';
import { Divider } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';
import { STATE_PLAYING, useTrackPlayerProgress } from 'react-native-track-player';
import Slider from '@react-native-community/slider';
import Theme from 'TTB/src/theme/Theme';
import GoogleCast from 'react-native-google-cast';
import { ImageButton, ModalSelector } from 'TTB/src/theme/Components';
import { t } from 'TTB/src/services/i18n';
import { useSafeArea } from 'react-native-safe-area-context';
import AudioManager from 'TTB/src/services/audio';
import { formatTime } from 'TTB/src/lib/utils';
import Collapsible from 'react-native-collapsible-updated';
import { usePlayerControls, usePlayerTrack } from './Player.hooks';
import AddToPlaylist from './AddToPlaylist';
import StartDevotion from './StartDevotion';
import I18nManager from '../../../services/i18n';
import { DownloadModal, LoginModal, ShareModal } from '../../../theme/Components.modal';
import { useStore } from '../../../model/root';
import { uiState } from '../../../model/ui-state';
import { CastButton } from 'react-native-google-cast'
/* MARK: - Layout Styles */

const layoutStyles = EStyleSheet.create({
  container: {
    flexDirection: 'row'
  },
  player: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    display: 'flex',
    width: '100%',
    alignSelf: 'flex-end',
    backgroundColor: Theme.colors.player.background,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30
  },
  playerHeaderText: {
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  playerHeaderDivider: {
    marginTop: 25,
    marginBottom: 10,
    width: 200,
    alignSelf: 'center',
    height: 1
  },
  playerHeaderButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 5
  },
  playerContainer: {
    paddingHorizontal: '2%'
  },
  playerProgress: {
    paddingHorizontal: 10,
    height: 48,
    flexDirection: I18nManager.isRTL() ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  playerProgressSlider: {
    flex: 1,
    '@media (direction: rtl)': {
      transform: [{ scaleX: -1 }]
    },
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 5
  },
  playerAudioControls: {
    flexDirection: I18nManager.isRTL() ? 'row-reverse' : 'row',
    marginBottom: 20
  },
  playerVolumeBar: {
    paddingHorizontal: 10,
    height: 48,
    flexDirection: I18nManager.isRTL() ? 'row-reverse' : 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  playerVolumeBarSlider: {
    flex: 1,
    '@media (direction: rtl)': {
      transform: [{ scaleX: -1 }]
    },
    alignItems: 'stretch',
    justifyContent: 'center',
    paddingHorizontal: 10
  },
  playerBottomButtons: {
    flexDirection: 'row'
  },
  rateNumber: {
    fontFamily: 'NotoSerif-Bold',
    fontSize: '20 rem',
    color: Theme.colors.text
  },
  rateX: {
    fontFamily: 'NotoSerif-Bold',
    fontSize: '10 rem',
    color: Theme.colors.text
  }
});

/* MARK: - UI Components */

const PlayerControls = ({ disabled, onUpdateAudio }: { disabled: boolean, onUpdateAudio: any }) => {
  const { play, pause, rewind, forward, playbackState } = usePlayerControls();
  const isPlaying = playbackState === STATE_PLAYING;

  return (
    <View style={{ ...layoutStyles.playerAudioControls, opacity: disabled ? 0.5 : 1 }}>
      <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center' }}>
        <ImageButton
          disabled={disabled}
          image={Theme.images.player.back30}
          onPress={async () => {
            await rewind();
            if (onUpdateAudio) {
              onUpdateAudio();
            }
          }}
        />
      </View>

      <View
        style={{
          flex: 1,
          flexDirection: I18nManager.isRTL() ? 'row-reverse' : 'row',
          justifyContent: 'center'
        }}
      >
        <ImageButton
          disabled={disabled}
          image={Theme.images.player.back}
          onPress={async () => {
            if ((await AudioManager.getPosition()) > 0) {
              AudioManager.seekTo(0);
              if (onUpdateAudio) {
                onUpdateAudio();
              }
            } else {
              await AudioManager.trackPlayer.skipToPrevious();
            }
          }}
        />
        {isPlaying ? (
          <ImageButton
            disabled={disabled}
            image={Theme.images.player.pause}
            onPress={async () => {
              await pause();
              if (onUpdateAudio) {
                onUpdateAudio();
              }
            }}
            size={57}
          />
        ) : (
          <ImageButton
            disabled={disabled}
            image={Theme.images.player.play}
            onPress={async () => {
              await play();
              if (onUpdateAudio) {
                onUpdateAudio();
              }
            }}
            size={57}
          />
        )}

        <ImageButton
          disabled={disabled}
          image={Theme.images.player.forward}
          onPress={() => {
            AudioManager.trackPlayer.skipToNext();
          }}
        />
      </View>

      <View style={{ flex: 1, flexDirection: 'row-reverse', justifyContent: 'center' }}>
        <ImageButton
          disabled={disabled}
          image={Theme.images.player.forward30}
          onPress={async () => {
            await forward();
            if (onUpdateAudio) {
              onUpdateAudio();
            }
          }}
        />
      </View>
    </View>
  );
};

const PlayerSlider = ({
  audioDuration,
  disabled = false,
  onUpdateAudio
}: {
  audioDuration: number,
  disabled: boolean,
  onUpdateAudio: any
}) => {
  const [seeking, setSeeking] = useState(false);
  const [seekingPosition, setSeekingPosition] = useState(0);
  const {
    position = 0,
    duration: trackDuration = 0
  }: { position: number, duration: number } = useTrackPlayerProgress(0.1);
  const duration = audioDuration || trackDuration;
  const currentPosition = seeking ? seekingPosition : position;
  const trackPosition = currentPosition !== 0 && duration !== 0 ? currentPosition / duration : 0;

  return (
    <View style={{ ...layoutStyles.playerProgress }}>
      <Text style={{ ...Theme.palette.h7 }}>{formatTime(currentPosition)}</Text>
      <View style={{ ...layoutStyles.playerProgressSlider }}>
        <Slider
          disabled={disabled}
          thumbTintColor={Theme.colors.player.knob}
          minimumTrackTintColor={Theme.colors.player.progressElapsed}
          maximumTrackTintColor={Theme.colors.player.progressRemaining}
          value={trackPosition}
          onSlidingStart={() => {
            setSeekingPosition(position);
            setSeeking(true);
          }}
          onSlidingComplete={async value => {
            await AudioManager.seekTo(value * duration);
            await setSeeking(false);
            await setSeekingPosition(value * duration);
            if (onUpdateAudio) {
              onUpdateAudio();
            }
          }}
          onValueChange={value => setSeekingPosition(value * duration)}
          minimumValue={0}
          maximumValue={1}
        />
      </View>
      <Text style={{ ...Theme.palette.h7 }}>{formatTime(duration)}</Text>
    </View>
  );
};

const VolumeBar = () => {
  const [volume, setVolume] = useState(0.5);
  return (
    <View style={{ ...layoutStyles.playerVolumeBar }}>
      <Image source={Theme.images.player.volumeLeft} />

      <View style={{ ...layoutStyles.playerVolumeBarSlider }}>
        <Slider
          thumbTintColor={Theme.colors.player.knob}
          minimumTrackTintColor={Theme.colors.player.volumeLevel}
          maximumTrackTintColor={Theme.colors.player.volumeRemaining}
          value={volume}
          onValueChange={value => {
            setVolume(value);
            AudioManager.setVolume(value);
          }}
          minimumValue={0}
          maximumValue={1}
        />
      </View>

      <Image source={Theme.images.player.volumeRight} />
    </View>
  );
};

export default ({
  startMinimized = false,
  maximizable = true,
  disableControls = false,
  onQueueEnd,
  onUpdateAudio,
  close
}: {
  startMinimized: boolean,
  maximizable: boolean,
  disableControls: boolean,
  onQueueEnd: any,
  onUpdateAudio: any,
  close: any
}) => {
  const { favoritesState, settingsState } = useStore();
  const insets = useSafeArea();
  const { rate, track } = usePlayerTrack(onQueueEnd);
  const [minimized, setMinimized] = useState(startMinimized);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<boolean>(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showStartDevotionModal, setShowStartDevotionModal] = useState<boolean>(false);
  const [connectionType, setConnectionType] = useState(null);
  NetInfo.fetch().then(state => {
    setConnectionType(state.type);
  });
  return (
    <View style={{ ...layoutStyles.container }}>
      {/* Player */}
      <View
        style={{
          ...layoutStyles.player,
          paddingBottom: insets.bottom,
          ...(!maximizable
            ? {
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0
              }
            : {})
        }}
      >
        {maximizable && (
          <TouchableOpacity
            style={{
              justifyContent: 'center',
              alignItems: 'center',
              paddingTop: 12,
              paddingBottom: 12
            }}
            onPress={() => setMinimized(!minimized)}
          >
            <Image
              source={Theme.images.down}
              style={{ transform: [{ scaleY: minimized ? -1 : 1 }] }}
            />
          </TouchableOpacity>
        )}
        {/* Player Header */}
        <Collapsible collapsed={minimized}>
          <View>
            {/* Player Header Text */}
            <View style={{ ...layoutStyles.playerHeaderText }}>
              <Text style={{ ...Theme.palette.h3 }}>
                {track ? track.title : t('teaching.player.loading')}
              </Text>
              {track && track.subtitle && (
                <Text style={{ ...Theme.palette.h7 }}>{track ? track.subtitle : ''}</Text>
              )}
            </View>

            {/* Player Header Divider */}
            <Divider
              style={{ backgroundColor: Theme.colors.divider, ...layoutStyles.playerHeaderDivider }}
            />

            {/* Player Header Buttons */}
            <View style={{ ...layoutStyles.playerHeaderButtons }}>
              <Observer>
                {() => (
                  <ImageButton
                    disabled={!track}
                    image={
                      track && favoritesState.isAdded(track)
                        ? Theme.images.player.heartFilled
                        : Theme.images.player.heart
                    }
                    onPress={() => {
                      if (track) {
                        if (favoritesState.isAdded(track)) {
                          favoritesState.removeTrack(track);
                        } else {
                          favoritesState.addTrack(track);
                        }
                      }
                    }}
                  />
                )}
              </Observer>

              <ImageButton
                disabled={!track}
                image={Theme.images.player.share}
                onPress={() => {
                  setShowShareModal(true);
                }}
                mirrorRTL
              />

              <ImageButton
                image={Theme.images.player.message}
                disabled={!track}
                onPress={() => {
                  if (uiState.isAuthenticated) {
                    setShowStartDevotionModal(true);
                  } else {
                    setShowLoginModal(true);
                  }
                }}
                mirrorRTL
              />
              <View
                style={{
                  
                  alignContent: 'center',
                  justifyContent: 'center'
                }}
              >
                <CastButton style={{ width: 48, height: 48, alignSelf: 'center' }} />
              </View>
            </View>
          </View>
        </Collapsible>

        {/* Player Container */}
        <View
          style={{
            ...layoutStyles.playerContainer,
            borderTopWidth: 1,
            borderTopColor: Theme.colors.player.divider
          }}
        >
          {/* Progress Slider */}
          <PlayerSlider
            disabled={!track || disableControls}
            audioDuration={track ? track.duration : null}
            onUpdateAudio={onUpdateAudio}
          />

          {/* Audio Controls */}
          <PlayerControls disabled={!track || disableControls} onUpdateAudio={onUpdateAudio} />

          <Collapsible collapsed={minimized}>
            {/* Volume Bar */}
            <VolumeBar />

            {/* Bottom Buttons */}
            <View style={{ ...layoutStyles.playerBottomButtons }}>
              <View style={{ flex: 1, flexDirection: 'row' }}>
                <ModalSelector
                  selectedKey={rate.get}
                  data={[
                    { key: 0, section: true, label: t('teaching.player.audioSpeed') },
                    ...rate.options
                  ]}
                  onChange={option => {
                    if (option.key) {
                      rate.set(option.key);
                    }
                  }}
                >
                  <View
                    style={{
                      height: 48,
                      width: 48,
                      alignContent: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    <Text style={{ ...layoutStyles.rateNumber, alignSelf: 'center' }}>
                      {rate.get}
                      <Text style={{ ...layoutStyles.rateX }}>x</Text>
                    </Text>
                  </View>
                </ModalSelector>
              </View>

              <View
                style={{
                  flex: 1,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <ImageButton
                  disabled={
                    !track ||
                    (connectionType !== 'wifi' && settingsState.settingsProfile.downloadOnlyOnWifi)
                  }
                  image={Theme.images.options.download}
                  onPress={() => setShowDownloadModal(true)}
                />
                <DownloadModal
                  show={showDownloadModal}
                  close={() => setShowDownloadModal(false)}
                  track={track}
                />
              </View>

              <View style={{ flex: 1, flexDirection: 'row-reverse' }}>
                <ImageButton
                  disabled={!track}
                  image={Theme.images.player.playlist}
                  onPress={() => {
                    if (track) {
                      setShowAddToPlaylist(true);
                    }
                  }}
                />
                <AddToPlaylist
                  track={track}
                  show={showAddToPlaylist}
                  close={() => setShowAddToPlaylist(false)}
                />
              </View>
            </View>
          </Collapsible>
        </View>
      </View>
      <LoginModal
        close={navigated => {
          setShowLoginModal(false);
          if (navigated && close) {
            close();
          }
        }}
        show={showLoginModal}
      />
      <ShareModal show={showShareModal} close={() => setShowShareModal(false)} item={track} />
      <Observer>
        {() => {
          return (
            <>
              {uiState.isAuthenticated && (
                <StartDevotion
                  show={showStartDevotionModal}
                  close={navigated => {
                    setShowStartDevotionModal(false);
                    if (navigated && close) {
                      close();
                    }
                  }}
                  track={track}
                />
              )}
            </>
          );
        }}
      </Observer>
    </View>
  );
};
