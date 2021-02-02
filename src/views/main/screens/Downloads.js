/**
 * @flow
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Observer } from 'mobx-react';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useFocusEffect } from 'react-navigation-hooks';
import { View } from 'react-native';
import { Divider } from 'react-native-elements';
import analytics from '@segment/analytics-react-native';
import { t } from 'TTB/src/services/i18n';
import Theme from 'TTB/src/theme/Theme';
import MediaList from 'TTB/src/theme/Components.mediaList';
import { useDownloads } from './Downloads.hooks';
import AudioManager from '../../../services/audio';
import ToggleButton from './ToggleButton';
import Player from './Player';
import { LoginModal, Option, OptionsModal, ShareModal } from '../../../theme/Components.modal';
import AddToPlaylist from './AddToPlaylist';
import { useStore } from '../../../model/root';
import StartDevotion from './StartDevotion';
import type { Audio } from '../../../lib/types';
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
export default ({ currentTab }: { currentTab: ['favorites', 'playlists', 'downloads'] }) => {
  const { favoritesState, uiState } = useStore();
  /* Hooks */
  const { refresh, deleteTrack, tracks, loading } = useDownloads();
  const [loop, setLoop] = useState<boolean>(false);
  const [shuffle, setShuffle] = useState<boolean>(false);
  const [showMediaItemOptions, setShowMediaItemOptions] = useState<Audio>(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [showShareModal, setShowShareModal] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showStartDevotionModal, setShowStartDevotionModal] = useState<Audio>(null);

  const updateTracks = useCallback(() => {
    if (tracks && !loading) {
      AudioManager.setTracks([...tracks]);
    }
    return () => AudioManager.trackPlayer.reset();
  }, [tracks, loading]);

  useFocusEffect(
    useCallback(() => {
      if (currentTab === 'downloads') {
        refresh();
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentTab])
  );

  const logAnalytic = useCallback(() => {
    if (currentTab === 'downloads') {
      analytics.screen('Downloads');
    }
  }, [currentTab]);

  useFocusEffect(logAnalytic);

  useEffect(() => {
    if (currentTab === 'downloads') {
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
            onRefresh={refresh}
            refreshing={loading}
            data={tracks}
            onDeleteItem={item => {
              const newData = deleteTrack(item);
              return newData;
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
                  setShowShareModal(showMediaItemOptions);
                  setShowMediaItemOptions(null);
                }}
              />
              <Option
                title={t('options.audio.removeDownload')}
                icon={Theme.images.options.minusSquare}
                onPress={() => {
                  deleteTrack(showMediaItemOptions);
                  setShowMediaItemOptions(null);
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
          </>
        )}
      </Observer>
      <ShareModal
        show={!!showShareModal}
        close={() => setShowShareModal(null)}
        item={showShareModal}
      />
      <LoginModal close={() => setShowLoginModal(false)} show={showLoginModal} />
    </View>
  );
};
