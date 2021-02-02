/**
 * @flow
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Observer } from 'mobx-react';
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
import { Option, OptionsModal, ShareModal, DownloadModal } from '../../../theme/Components.modal';
import ToggleButton from './ToggleButton';
import AddToPlaylist from './AddToPlaylist';
import type { Audio } from '../../../lib/types';
import { useDownload } from './Downloads.hooks';
import { useStore } from '../../../model/root';
import { useCollection } from './Collection.hooks';
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

export default () => {
  const { favoritesState, uiState } = useStore();
  /* Hooks */
  const navigation = useNavigation();
  const bookId = useNavigationParam<string>('bookId');
  const name = useNavigationParam<string>('name');
  const [loop, setLoop] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const { tracks, refresh, loading } = useCollection(bookId);
  const [showMediaItemOptions, setShowMediaItemOptions] = useState<Audio>(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [showMediaItemShare, setShowMediaItemShare] = useState(null);
  const [showMediaItemDownload, setShowMediaItemDownload] = useState(null);
  const [showStartDevotionModal, setShowStartDevotionModal] = useState<Audio>(null);
  const [track, setTrack] = useState<Audio>(null);
  const { isDownloaded, deleteDownload } = useDownload(showMediaItemOptions);

  useFocusEffect(
    useCallback(() => {
      analytics.screen('Collection', {
        bookId
      });
    }, [bookId])
  );

  useEffect(() => {
    if (tracks && !loading) {
      AudioManager.setTracks([...tracks]);
    }
    return () => AudioManager.trackPlayer.reset();
  }, [loading, tracks]);

  useTrackPlayerEvents(['playback-track-changed'], async () => {
    const trackId = await AudioManager.currentTrackId();
    const currentTrack = await AudioManager.trackPlayer.getTrack(trackId);
    setTrack(currentTrack);
  });

  const backgroundImageSrc = useTeachingBackground(track);

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
                  title: t('collection.header'),
                  leftButtonImage: Theme.images.backLight
                },
                hooks: {
                  onLeftButtonPress: () => {
                    navigation.goBack();
                  }
                }
              }}
            />
            {/* Content */}
            <View style={{ flex: 1, flexDirection: 'column' }}>
              {/* Title */}
              <View style={{ alignItems: 'center', marginTop: 30, marginBottom: 30 }}>
                <Text style={{ ...Theme.palette.h2, ...styles.titleText }}>{name}</Text>
                <Text style={{ ...Theme.palette.h2, ...styles.subtitleText }}>
                  {loading && tracks.length === 0
                    ? t('uiControls.loading')
                    : `${tracks.length} ${t('collection.audioFilesLabel')}`}
                </Text>
              </View>

              {/* Playlist */}
              <View style={{ ...styles.container }}>
                {/* Buttons */}
                <View style={{ ...styles.actionContainer }}>
                  <Divider style={{ ...styles.divider }} />
                  <View style={{ ...styles.actionButtonContainer }}>
                    <ToggleButton
                      style={{ ...styles.actionButton, marginRight: 12 }}
                      image={Theme.images.playlist.shuffle}
                      imageSelected={Theme.images.playlist.shuffleSelected}
                      onPress={() => {
                        if (shuffle) {
                          AudioManager.unShuffle([...tracks]);
                        } else {
                          AudioManager.shuffle([...tracks]);
                        }
                        setShuffle(!shuffle);
                      }}
                      text={t('buttons.shuffle')}
                      selected={shuffle}
                    />
                    <ToggleButton
                      style={{ ...styles.actionButton, marginLeft: 12 }}
                      image={Theme.images.playlist.loop}
                      imageSelected={Theme.images.playlist.loopSelected}
                      onPress={() => {
                        setLoop(!loop);
                      }}
                      text={t('buttons.loop')}
                      selected={loop}
                    />
                  </View>
                  <Divider style={{ ...styles.divider }} />
                </View>
                <MediaList
                  onRefresh={refresh}
                  refreshing={loading}
                  data={tracks}
                  onSelectItem={item => {
                    AudioManager.skipToTrack(item.id);
                  }}
                  onOptionsPressed={item => {
                    setShowMediaItemOptions(item);
                  }}
                />
              </View>
              <Player
                startMinimized
                maximizable={true}
                onQueueEnd={() => {
                  if (loop) {
                    AudioManager.setTracks(tracks);
                  }
                }}
              />
            </View>
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
                title={t('options.audio.addPlaylist')}
                icon={Theme.images.options.addSong}
                onPress={() => {
                  setShowAddToPlaylist(true);
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

            {uiState.isAuthenticated && (
              <StartDevotion
                show={!!showStartDevotionModal}
                close={() => {
                  setShowStartDevotionModal(false);
                }}
                track={showStartDevotionModal}
              />
            )}

            <ShareModal
              show={!!showMediaItemShare}
              close={() => setShowMediaItemShare(null)}
              item={showMediaItemShare}
            />
            <DownloadModal
              show={!!showMediaItemDownload}
              close={() => setShowMediaItemDownload(null)}
              track={showMediaItemDownload}
            />
          </View>
        </View>
      )}
    </Observer>
  );
};
