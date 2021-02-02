/**
 * @flow
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Observer, observer } from 'mobx-react';
import { Image, Text, View } from 'react-native';
import { useFocusEffect, useNavigation, useNavigationParam } from 'react-navigation-hooks';
import analytics from '@segment/analytics-react-native';
import { Header } from 'TTB/src/theme/Components';
import Theme from 'TTB/src/theme/Theme';
import EStyleSheet from 'react-native-extended-stylesheet';
import MediaList from 'TTB/src/theme/Components.mediaList';
import { t } from 'TTB/src/services/i18n';
import { Divider } from 'react-native-elements';
import { useTrackPlayerEvents } from 'react-native-track-player';
import AudioManager from '../../../services/audio';
import Player from './Player';
import {
  Option,
  OptionsModal,
  ShareModal,
  DownloadModal,
  LoginModal
} from '../../../theme/Components.modal';
import ToggleButton from './ToggleButton';
import AddToPlaylist from './AddToPlaylist';
import type { Audio } from '../../../lib/types';
import { useDownload } from './Downloads.hooks';
import { useStore } from '../../../model/root';
import StartDevotion from './StartDevotion';
import useTeachingBackground from './useTeachingBackground';

/* MARK: - Layout Styles */

const styles = EStyleSheet.create({
  backgroundImage: {
    width: '100%',
    position: 'absolute',
    height: '100%'
  },
  titleText: {
    color: Theme.colors.playlist.title,
    textAlign: 'center'
  },
  subtitleText: {
    fontFamily: 'NotoSans-Regular',
    fontSize: '12 rem',
    letterSpacing: 0,
    color: Theme.colors.playlist.title,
    textAlign: 'center'
  },
  container: {
    backgroundColor: 'white',
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20
  },
  actionContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginBottom: 22,
    marginLeft: 20,
    marginRight: 20
  },
  actionButtonContainer: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch'
  },
  actionButton: {
    flex: 1
  },
  createPlayListLabel: {
    ...Theme.palette.h7,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginLeft: 20
  },
  divider: {
    height: 1,
    backgroundColor: Theme.colors.divider
  }
});

/* MARK: - UI Components */

export default observer(() => {
  const { favoritesState, playlistsState, uiState } = useStore();
  const navigation = useNavigation();
  const [editing, setEditing] = useState<boolean>(useNavigationParam('editing'));
  const [showOptionsModal, setShowOptionsModal] = useState<boolean>(false);
  const [loop, setLoop] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [showMediaItemOptions, setShowMediaItemOptions] = useState<Audio>(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showMediaItemShare, setShowMediaItemShare] = useState(null);
  const [showMediaItemDownload, setShowMediaItemDownload] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showStartDevotionModal, setShowStartDevotionModal] = useState<Audio>(null);
  const { isDownloaded, deleteDownload } = useDownload(showMediaItemOptions);
  const [track, setTrack] = useState<Audio>(null);
  const { tracks } = playlistsState;

  useTrackPlayerEvents(['playback-track-changed'], async () => {
    const trackId = await AudioManager.currentTrackId();
    const currentTrack = await AudioManager.trackPlayer.getTrack(trackId);
    setTrack(currentTrack);
  });

  const backgroundImageSrc = useTeachingBackground(track);

  useFocusEffect(
    useCallback(() => {
      analytics.screen('Playlist', {
        name: playlistsState.playlistName
      });
    }, [playlistsState.playlistName])
  );

  const updateAudioPlayer = useCallback(() => {
    if (playlistsState.editingTracks) {
      AudioManager.setTracks([...playlistsState.editingTracks]);
    }
    return () => AudioManager.trackPlayer.reset();
  }, [playlistsState.editingTracks]);

  useEffect(() => updateAudioPlayer, [updateAudioPlayer]);

  const updateTracks = useCallback(() => {
    if (tracks) {
      AudioManager.setTracks([...tracks]);
    }
    return () => AudioManager.trackPlayer.reset();
  }, [tracks]);

  useFocusEffect(
    useCallback(() => {
      updateTracks();
    }, [updateTracks])
  );

  useEffect(() => {
    updateTracks();
  }, [updateTracks]);

  /* Render */
  return (
    <Observer>
      {() => (
        <View style={{ flex: 1 }}>
          {/* Background Image */}
          <Image
            style={{ ...styles.backgroundImage, ...Theme.palette.image }}
            source={backgroundImageSrc}
          />
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)' }}>
            {/* Header */}
            <Header
              config={{
                headerStyle: 'light',
                ui: {
                  title: t('playlist.header'),
                  leftButtonImage: editing ? Theme.images.cancel : Theme.images.back,
                  rightButtonImage: editing ? Theme.images.save : Theme.images.moreLight
                },
                hooks: {
                  onLeftButtonPress: () => {
                    if (editing) {
                      playlistsState.cancelEditingTracks();
                      setEditing(false);
                    } else {
                      navigation.goBack();
                    }
                  },
                  onRightButtonPress: () => {
                    if (editing) {
                      playlistsState.saveEditingTracks();
                      setEditing(false);
                    } else {
                      setShowOptionsModal(true);
                    }
                  }
                }
              }}
            />
            {/* Content */}
            <View style={{ flex: 1, flexDirection: 'column' }}>
              {/* Title */}
              <View style={{ alignItems: 'center', marginTop: 30, marginBottom: 30 }}>
                <Text style={{ ...Theme.palette.h2, ...styles.titleText }}>
                  {playlistsState.playlistName}
                </Text>
                <Text style={{ ...Theme.palette.h2, ...styles.subtitleText }}>
                  {playlistsState.editingTracks.length >= 2
                    ? `${playlistsState.editingTracks.length} ${t('playlist.audioFileLabel')}`
                    : `${playlistsState.editingTracks.length} ${t('playlist.audioFilesLabel')}`}
                </Text>
              </View>

              {/* Playlist */}
              <View style={{ ...styles.container }}>
                {/* Buttons */}
                {!editing && (
                  <View style={{ ...styles.actionContainer }}>
                    <Divider style={{ ...styles.divider }} />
                    <View style={{ ...styles.actionButtonContainer }}>
                      <ToggleButton
                        style={{ ...styles.actionButton, marginRight: 12 }}
                        image={Theme.images.playlist.shuffle}
                        imageSelected={Theme.images.playlist.shuffleSelected}
                        onPress={() => {
                          if (shuffle) {
                            AudioManager.unShuffle([...playlistsState.editingTracks]);
                          } else {
                            AudioManager.shuffle([...playlistsState.editingTracks]);
                          }
                          setShuffle(!shuffle);
                        }}
                        text="Shuffle"
                        selected={shuffle}
                      />
                      <ToggleButton
                        style={{ ...styles.actionButton, marginLeft: 12 }}
                        image={Theme.images.playlist.loop}
                        imageSelected={Theme.images.playlist.loopSelected}
                        onPress={() => {
                          setLoop(!loop);
                        }}
                        text="Loop"
                        selected={loop}
                      />
                    </View>
                    <Divider style={{ ...styles.divider }} />
                  </View>
                )}
                <MediaList
                  data={tracks}
                  onSort={item => {
                    playlistsState.swapEditingTracks(
                      item.data[item.from].contentId,
                      item.data[item.to].contentId
                    );
                  }}
                  onDeleteItem={item => {
                    playlistsState.removeEditingTrack(item.contentId);
                  }}
                  onSelectItem={item => {
                    if (!editing) {
                      AudioManager.skipToTrack(item.id);
                    }
                  }}
                  onOptionsPressed={item => {
                    setShowMediaItemOptions(item);
                  }}
                  editable={editing}
                  sortable={editing}
                />
              </View>
              <Player
                startMinimized
                maximizable={false}
                onQueueEnd={() => {
                  if (loop) {
                    AudioManager.setTracks([...playlistsState.editingTracks]);
                  }
                }}
              />
            </View>
            <OptionsModal
              show={showOptionsModal}
              title={playlistsState.playlistName}
              subtitle={
                playlistsState.editingTracks.length >= 2
                  ? `${playlistsState.editingTracks.length} ${t('playlist.audioFilesLabel')}`
                  : `${playlistsState.editingTracks.length} ${t('playlist.audioFileLabel')}`
              }
              icon={Theme.images.defaultIcon}
              close={() => setShowOptionsModal(false)}
            >
              <Option
                title={t('options.playlist.edit')}
                icon={Theme.images.options.addSong}
                onPress={() => {
                  setEditing(true);
                  setShowOptionsModal(false);
                }}
              />
              <Option
                title={t('options.playlist.delete')}
                icon={Theme.images.options.trash}
                onPress={() => {
                  playlistsState.removePlaylist(playlistsState.playlistName);
                  setShowOptionsModal(null);
                  navigation.goBack();
                }}
              />
            </OptionsModal>
            <OptionsModal
              show={!!showMediaItemOptions}
              title={showMediaItemOptions ? showMediaItemOptions.title : ' '}
              subtitle={showMediaItemOptions ? showMediaItemOptions.subtitle : ' '}
              icon={Theme.images.defaultIcon}
              close={() => setShowMediaItemOptions(null)}
            >
              <Option
                title={
                  showMediaItemOptions && favoritesState.isAdded(showMediaItemOptions)
                    ? t('options.audio.removeFavorite')
                    : t('options.audio.addFavorite')
                }
                icon={
                  showMediaItemOptions && favoritesState.isAdded(showMediaItemOptions)
                    ? Theme.images.options.minusSquare
                    : Theme.images.options.heartOutline
                }
                onPress={() => {
                  if (showMediaItemOptions) {
                    if (favoritesState.isAdded(showMediaItemOptions)) {
                      favoritesState.removeTrack(showMediaItemOptions);
                    } else {
                      favoritesState.addTrack(showMediaItemOptions);
                    }
                  }
                }}
              />
              <Option
                title={t('options.audio.removePlaylist')}
                icon={Theme.images.options.minusSquare}
                onPress={() => {
                  if (editing) {
                    playlistsState.removeEditingTrack(showMediaItemOptions.contentId);
                  } else {
                    playlistsState.removeTrack(
                      playlistsState.playlistName,
                      showMediaItemOptions.contentId
                    );
                  }
                  setShowMediaItemOptions(null);
                }}
              />
              {uiState.isAuthenticated && (
                <Option
                  title={t('options.startDevotion')}
                  icon={Theme.images.options.message}
                  onPress={() => {
                    setShowStartDevotionModal(showMediaItemOptions);
                    setShowMediaItemOptions(null);
                  }}
                />
              )}
              <Option
                title={t('options.shared.share')}
                icon={Theme.images.options.share}
                onPress={() => {
                  setShowMediaItemShare(showMediaItemOptions);
                  setShowMediaItemOptions(null);
                }}
              />
              <Option
                title={
                  isDownloaded ? t('options.audio.removeDownload') : t('options.audio.download')
                }
                icon={
                  isDownloaded ? Theme.images.options.minusSquare : Theme.images.options.download
                }
                onPress={() => {
                  if (isDownloaded) {
                    deleteDownload(showMediaItemOptions);
                  } else {
                    setShowMediaItemDownload(showMediaItemOptions);
                    setShowMediaItemOptions(null);
                  }
                }}
              />
              <Option
                title={t('options.shared.report')}
                icon={Theme.images.options.report}
                onPress={() => {}}
              />
              <AddToPlaylist
                track={showMediaItemOptions}
                show={showAddToPlaylist}
                close={() => setShowAddToPlaylist(false)}
              />
            </OptionsModal>
            <ShareModal
              show={!!showMediaItemShare}
              close={() => setShowMediaItemShare(null)}
              item={showMediaItemShare}
            />
            <ShareModal
              show={showShareModal}
              close={() => setShowShareModal(false)}
              // item={playlist}
            />
            <DownloadModal
              show={!!showMediaItemDownload}
              close={() => setShowMediaItemDownload(null)}
              track={showMediaItemDownload}
            />
            <LoginModal close={() => setShowLoginModal(false)} show={showLoginModal} />
            {uiState.isAuthenticated && (
              <StartDevotion
                show={!!showStartDevotionModal}
                close={() => {
                  setShowStartDevotionModal(false);
                }}
                track={showStartDevotionModal}
              />
            )}
          </View>
        </View>
      )}
    </Observer>
  );
});
