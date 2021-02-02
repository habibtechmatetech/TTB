/**
 * @flow
 */

import React, { useCallback, useState } from 'react';
import { Observer, observer } from 'mobx-react';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Text, View, TouchableOpacity } from 'react-native';
import analytics from '@segment/analytics-react-native';
import Theme from 'TTB/src/theme/Theme';
import MediaList from 'TTB/src/theme/Components.mediaList';
import { useFocusEffect, useNavigation } from 'react-navigation-hooks';
import { t } from 'TTB/src/services/i18n';
import { ImageButton } from '../../../theme/Components';
import CreatePlaylist from './CreatePlaylist';
import { Option, OptionsModal } from '../../../theme/Components.modal';
import { useStore } from '../../../model/root';

const styles = EStyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
    borderRadius: 30
  },
  createPlayListContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginTop: 30,
    marginBottom: 22,
    marginLeft: 15,
    marginRight: 15
  },
  createPlayListLabel: {
    ...Theme.palette.h7,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginLeft: 20
  }
});

const Playlists = ({ currentTab }: { currentTab: ['favorites', 'playlists', 'downloads'] }) => {
  const { playlistsState } = useStore();
  const { playlists } = playlistsState;
  const { navigate } = useNavigation();
  const [showCreatePlaylist, setShowCreatePlaylist] = useState<boolean>(false);
  const [showMediaItemOptions, setShowMediaItemOptions] = useState<Audio>(null);

  const logAnalytic = useCallback(() => {
    if (currentTab === 'playlists') {
      analytics.screen('Playlists');
    }
  }, [currentTab]);

  useFocusEffect(logAnalytic);

  return (
    <Observer>
      {() => (
        <View style={{ ...styles.container }}>
          <TouchableOpacity onPress={() => setShowCreatePlaylist(true)}>
            <View style={{ ...styles.createPlayListContainer }}>
              <ImageButton
                image={Theme.images.playlists.createPlaylist}
                color={Theme.colors.button}
                colorHighlight={Theme.colors.buttonHighlight}
                size={40}
                onPress={() => {
                  setShowCreatePlaylist(true);
                }}
              />
              <Text style={{ ...styles.createPlayListLabel }}>
                {t('modal.createPlaylist.title')}
              </Text>
            </View>
          </TouchableOpacity>
          <MediaList
            data={playlists}
            onDeleteItem={item => {
              playlistsState.removePlaylist(item.name);
            }}
            onSelectItem={item => {
              playlistsState.setPlaylistName(item.name);
              navigate('Playlist', { editing: false });
            }}
            onOptionsPressed={item => {
              setShowMediaItemOptions(item);
            }}
            editable
          />
          <CreatePlaylist show={showCreatePlaylist} close={() => setShowCreatePlaylist(false)} />
          <OptionsModal
            show={!!showMediaItemOptions}
            title={showMediaItemOptions ? showMediaItemOptions.name : ' '}
            subtitle={showMediaItemOptions ? showMediaItemOptions.subtitle : ' '}
            icon={Theme.images.defaultIcon}
            close={() => setShowMediaItemOptions(null)}
          >
            <Option
              title={t('options.playlist.edit')}
              icon={Theme.images.options.addSong}
              onPress={() => {
                playlistsState.setPlaylistName(showMediaItemOptions.name);
                navigate('Playlist', { editing: true });
                setShowMediaItemOptions(null);
              }}
            />
            <Option
              title={t('options.playlist.delete')}
              icon={Theme.images.options.trash}
              onPress={() => {
                playlistsState.removePlaylist(showMediaItemOptions.name);
                setShowMediaItemOptions(null);
              }}
            />
          </OptionsModal>
        </View>
      )}
    </Observer>
  );
};

export default observer(Playlists);
