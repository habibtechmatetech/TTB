/**
 * @flow
 */

import React, { useCallback, useEffect, useState } from 'react';
import Theme from 'TTB/src/theme/Theme';
import { Header } from 'TTB/src/theme/Components';
import { t } from 'TTB/src/services/i18n';
import type { Teaching } from 'TTB/src/lib/types';
import EStyleSheet from 'react-native-extended-stylesheet';
import { buildTeaching } from 'TTB/src/services/teachings';
import Player from 'TTB/src/views/main/screens/Player';
import { Image, View } from 'react-native';
import { OptionsModal, Option } from 'TTB/src/theme/Components.modal';
import { useFocusEffect } from 'react-navigation-hooks';
import analytics from '@segment/analytics-react-native';
import { observer } from 'mobx-react';
import AudioManager from '../../../services/audio';
import AddToPlaylist from './AddToPlaylist';
import { DownloadModal, ShareModal } from '../../../theme/Components.modal';
import { useDownload } from './Downloads.hooks';
import { usePlayerTrack } from './Player.hooks';
import { useStore } from '../../../model/root';
import useTeachingBackground from './useTeachingBackground';

/* MARK: - Layout Styles */
const layoutStyles = EStyleSheet.create({
  backgroundImage: {
    width: '100%',
    position: 'absolute',
    height: '100%'
  }
});

export default observer(({ teachings, dismiss }: { teachings: [Teaching], dismiss: Function }) => {
  /* Hooks */
  const { favoritesState } = useStore();
  const [tracks, setTracks] = useState<Audio>(null);
  const { track } = usePlayerTrack();
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState<boolean>(false);
  const [showShareModal, setShowShareModal] = useState<boolean>(false);
  const { isDownloaded, deleteDownload } = useDownload(track);

  useFocusEffect(
    useCallback(() => {
      analytics.screen('Teaching');
    }, [])
  );

  useEffect(() => {
    async function init() {
      const newTracks = [];
      teachings.forEach(teaching => {
        newTracks.push(buildTeaching(teaching));
      });
      setTracks(newTracks);
    }
    init();
    return () => AudioManager.trackPlayer.reset();
  }, [teachings]);

  useEffect(() => {
    async function init() {
      await AudioManager.setTracks(tracks);
      await AudioManager.play();
    }
    if (tracks) {
      init();
    }
  }, [tracks]);

  const backgroundImageSrc = useTeachingBackground(track);

  /* Render */
  return (
    <View style={{ flex: 1 }}>
      {/* Background Image */}
      <Image
        style={{ ...layoutStyles.backgroundImage, ...Theme.palette.image }}
        source={backgroundImageSrc}
      />
      {/* Header */}
      <Header
        config={{
          headerStyle: 'light',
          ui: {
            title: t('teaching.header'),
            leftButtonImage: Theme.images.down,
            rightButtonImage: Theme.images.moreLight
          },
          hooks: {
            onLeftButtonPress: dismiss,
            onRightButtonPress: () => setShowOptionsModal(true)
          }
        }}
      />
      {/* Content */}
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Player close={() => dismiss()} />
      </View>
      <OptionsModal
        show={showOptionsModal}
        title={track ? track.title : t('teaching.loading')}
        subtitle={track ? track.subtitle : ''}
        icon={Theme.images.defaultIcon}
        close={() => setShowOptionsModal(false)}
      >
        <Option
          title={
            track && favoritesState.isAdded(track)
              ? t('options.audio.removeFavorite')
              : t('options.audio.addFavorite')
          }
          icon={
            track && favoritesState.isAdded(track)
              ? Theme.images.options.minusSquare
              : Theme.images.options.heartOutline
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
        <Option
          title={t('options.audio.addPlaylist')}
          icon={Theme.images.options.playlist}
          onPress={() => setShowAddToPlaylist(true)}
        />
        <Option
          title={t('options.shared.share')}
          icon={Theme.images.options.share}
          onPress={() => {
            setShowShareModal(true);
            setShowOptionsModal(null);
          }}
        />
        <Option
          title={isDownloaded ? t('options.audio.removeDownload') : t('options.audio.download')}
          icon={isDownloaded ? Theme.images.options.minusSquare : Theme.images.options.download}
          onPress={() => {
            if (isDownloaded) {
              deleteDownload();
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
          track={track || {}}
          show={showAddToPlaylist}
          close={() => setShowAddToPlaylist(false)}
        />
        <DownloadModal
          show={showDownloadModal}
          close={() => setShowDownloadModal(false)}
          track={track || {}}
        />
      </OptionsModal>
      <ShareModal show={showShareModal} close={() => setShowShareModal(false)} item={track} />
    </View>
  );
});
