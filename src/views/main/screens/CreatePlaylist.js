/**
 * @flow
 */

import React, { useState } from 'react';
import { View } from 'react-native';
import { t } from 'TTB/src/services/i18n';
import { showSuccessNotification, stringNotEmpty } from 'TTB/src/lib/utils';
import { ActionModal } from '../../../theme/Components.modal';
import { Button, Input } from '../../../theme/Components';
import { useStore } from '../../../model/root';

export default ({ show, close }: { show: boolean, close: any }) => {
  const { playlistsState } = useStore();
  const [playlistName, setPlaylistName] = useState('');

  const playlistNameIsValid = () => {
    return stringNotEmpty(playlistName) && !playlistsState.isPlaylistAdded(playlistName);
  };

  return (
    <ActionModal title={t('createPlaylistModal.title')} show={show} close={close}>
      <View style={{ flex: 0.75, marginHorizontal: 75 }}>
        <Input
          style={{ marginBottom: 20 }}
          placeholder={t('createPlaylistModal.inputPlaceholder')}
          value={playlistName}
          onChangeText={text => {
            setPlaylistName(text);
          }}
        />

        <Button
          style={{ marginVertical: 20 }}
          title={t('createPlaylistModal.button')}
          onPress={() => {
            playlistsState.addPlaylist(playlistName);
            showSuccessNotification(t('alert.playlists.create'));
            close();
          }}
          disabled={!playlistNameIsValid()}
        />
      </View>
    </ActionModal>
  );
};
