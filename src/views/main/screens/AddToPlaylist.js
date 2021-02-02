/**
 * @flow
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { Observer } from 'mobx-react';
import MediaList from 'TTB/src/theme/Components.mediaList';
import { t } from 'TTB/src/services/i18n';
import type { Audio } from '../../../lib/types';
import { ActionModal } from '../../../theme/Components.modal';
import { Button } from '../../../theme/Components';
import CreatePlaylist from './CreatePlaylist';
import { useStore } from '../../../model/root';

export default ({ track, show, close }: { track: Audio, show: boolean, close: any }) => {
  const { playlistsState } = useStore();
  const [showCreatePlaylist, setShowCreatePlaylist] = useState<boolean>(false);

  return (
    <Observer>
      {() => (
        <ActionModal title={t('addToPlaylistsModal.title')} show={show} close={close}>
          <View style={{ flex: 0.75 }}>
            <Button
              style={{ marginHorizontal: 75, marginBottom: 20 }}
              title={t('addToPlaylistsModal.button')}
              onPress={() => {
                setShowCreatePlaylist(true);
              }}
            />
            <MediaList
              data={playlistsState.playlists}
              onSelectItem={playlist => {
                playlistsState.addTrack(playlist.name, track);
                close();
              }}
            />
          </View>
          <CreatePlaylist show={showCreatePlaylist} close={() => setShowCreatePlaylist(false)} />
        </ActionModal>
      )}
    </Observer>
  );
};
