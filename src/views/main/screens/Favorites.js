/**
 * @flow
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Observer, observer } from 'mobx-react';
import { View } from 'react-native';
import { useFocusEffect } from 'react-navigation-hooks';
import analytics from '@segment/analytics-react-native';
import { Divider } from 'react-native-elements';
import Theme from 'TTB/src/theme/Theme';
import EStyleSheet from 'react-native-extended-stylesheet';
import MediaList from 'TTB/src/theme/Components.mediaList';
import { t } from 'TTB/src/services/i18n';
import AudioManager from '../../../services/audio';
import Player from './Player';
import {
  Option,
  OptionsModal,
  LoginModal,
  ShareModal,
  DownloadModal
} from '../../../theme/Components.modal';
import ToggleButton from './ToggleButton';
import AddToPlaylist from './AddToPlaylist';
import type { Audio } from '../../../lib/types';
import { useDownload } from './Downloads.hooks';
import { useStore } from '../../../model/root';
import StartDevotion from './StartDevotion';

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
    borderTopRightRadius: 30
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

const Favorite = ({ currentTab }: { currentTab: ['favorites', 'playlists', 'downloads'] }) => {
  /* Hooks */
  const { favoritesState, uiState } = useStore();
  const { tracks } = favoritesState;
  const [loop, setLoop] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [showMediaItemOptions, setShowMediaItemOptions] = useState<Audio>(null);
  const { isDownloaded, deleteDownload } = useDownload(showMediaItemOptions);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState<boolean>(false);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const [showStartDevotionModal, setShowStartDevotionModal] = useState<Audio>(null);

  const updateTracks = useCallback(() => {
    if (tracks) {
      AudioManager.setTracks([...tracks]);
    }
    return () => AudioManager.trackPlayer.reset();
  }, [tracks]);

  useFocusEffect(() => {
    if (currentTab === 'favorites') {
      updateTracks();
    }
  });

  const logAnalytic = useCallback(() => {
    if (currentTab === 'favorites') {
      analytics.screen('Favorites');
    }
  }, [currentTab]);

  useFocusEffect(logAnalytic);

  useEffect(() => {
    if (currentTab === 'favorites') {
      updateTracks();
    }
  }, [currentTab, updateTracks]);

  /* Render */
  return (
    <View style={{ flex: 1 }}>
      {/* Content */}
      <View style={{ flex: 1, flexDirection: 'column' }}>
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
            data={tracks}
            onDeleteItem={item => {
              favoritesState.removeTrack(item);
            }}
            onSelectItem={item => {
              AudioManager.skipToTrack(item.id);
            }}
            onOptionsPressed={item => {
              setShowMediaItemOptions(item);
            }}
            editable
          />
        </View>
        <Player
          startMinimized
          maximizable={false}
          onQueueEnd={() => {
            if (loop) {
              AudioManager.setTracks(tracks);
            }
          }}
        />
      </View>
      <Observer>
        {() => (
          <>
            <OptionsModal
              show={!!showMediaItemOptions}
              title={showMediaItemOptions ? showMediaItemOptions.title : ' '}
              subtitle={showMediaItemOptions ? showMediaItemOptions.subtitle : ' '}
              icon={Theme.images.defaultIcon}
              close={() => setShowMediaItemOptions(null)}
            >
              <Option
                title={t('options.audio.removeFavorite')}
                icon={Theme.images.options.minusSquare}
                onPress={() => {
                  favoritesState.removeTrack(showMediaItemOptions);
                  setShowMediaItemOptions(null);
                }}
              />
              <Option
                title={t('options.audio.addPlaylist')}
                icon={Theme.images.options.addSong}
                onPress={() => setShowAddToPlaylist(true)}
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
                  setShowShareModal(!!showMediaItemOptions);
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
                    setShowDownloadModal(true);
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
              <DownloadModal
                show={showDownloadModal}
                close={() => setShowDownloadModal(false)}
                track={showMediaItemOptions}
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
          </>
        )}
      </Observer>
      <LoginModal close={() => setShowLoginModal(false)} show={showLoginModal} />
      <ShareModal
        show={showShareModal}
        close={() => setShowShareModal(false)}
        item={showMediaItemOptions}
      />
    </View>
  );
};

export default observer(Favorite);
