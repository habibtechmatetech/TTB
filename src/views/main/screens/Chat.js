/**
 * @flow
 */

import React, { useRef, useState, useCallback, useEffect } from 'react';
import {
  Image,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  TextInput,
  ActivityIndicator,
  AppState
} from 'react-native';
import { useFocusEffect, useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { Header } from 'TTB/src/theme/Components';
import EStyleSheet from 'react-native-extended-stylesheet';
import I18Manager, { t } from 'TTB/src/services/i18n';
import Theme from 'TTB/src/theme/Theme';
import { useSafeArea } from 'react-native-safe-area-context';
import uuid from 'react-native-uuid';
import analytics from '@segment/analytics-react-native';
import { useStore } from 'TTB/src/model/root';
import moment from 'moment';
import colors from '../../../theme/colors';
import GroupSettings from './GroupSettings';
import ChatWebSocket from './ChatWebSocket';
import { useGroup } from './Groups.hooks';
import Player from './Player';
import AudioManager from '../../../services/audio';
import { buildTrack } from '../../../services/playlists';

const styles = EStyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'stretch'
  },
  item: {
    backgroundColor: 'white',
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginTop: 20,
    marginRight: 20,
    marginLeft: 20,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderColor: '#E7EEF6',
    borderWidth: 1,
    borderStyle: 'solid',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.1,
    shadowRadius: 20.0,
    elevation: 12
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: colors.background
  },
  messageBar: {
    flex: 1,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderStyle: 'solid',
    borderWidth: 2,
    borderRadius: 20,
    backgroundColor: '#FAFAFA',
    borderColor: 'rgba(0, 0, 0, 0.06)',
    marginRight: 20,
    color: '#000000'
  },
  messageBarBackground: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFAFA',
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
    borderTopWidth: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
    flexShrink: 0
  }
});

export default () => {
  // /* Hooks */
  const navigation = useNavigation();
  const insets = useSafeArea();
  const { uiState } = useStore();
  const groupData = useNavigationParam('group');
  const { group, loading, refresh, updateAudio } = useGroup(groupData.id);
  const [showGroupSettings, setShowGroupSettings] = useState<boolean>(false);
  const [message, setMessage] = useState('');
  const client = useRef();
  const contentId = group && group.contentId;
  const isOwner = group && uiState.user.id === group.owner;
  const [track, setTrack] = useState();
  const canSendMessage = !loading && group && group.inDevotion;
  const [chatActive, setChatActive] = useState(true);

  const { audioStatus, edited } = group || {
    audioStatus: 'PAUSED',
    edited: moment().format()
  };
  let { audioPosition } = group || {
    audioPosition: 0
  };
  audioPosition = parseInt(audioPosition, 10);

  useFocusEffect(
    useCallback(() => {
      analytics.screen('Chat');
    }, [])
  );

  const refreshAudio = useCallback(async () => {
    const secondsSinceEdit = moment().diff(edited, 's');
    if (!group) {
      return;
    }

    if (audioStatus === 'PAUSED') {
      await AudioManager.pause();
    }
    if (audioStatus === 'PLAYING') {
      await AudioManager.play();
    }

    await AudioManager.seekTo(audioPosition + secondsSinceEdit);
  }, [audioStatus, audioPosition, edited, group]);

  const changeAppStateListener = state => {
    if (state === 'active') {
      setChatActive(true);
    } else {
      setChatActive(false);
    }
  };

  useEffect(() => {
    AppState.addEventListener('change', changeAppStateListener);
    async function init() {
      if (contentId) {
        const tracks = await buildTrack({ contentId });
        if (tracks && tracks.length > 0) {
          setTrack(tracks[0]);
          await AudioManager.setTracks(tracks);
        }
      }
    }
    init();
    return () => AudioManager.trackPlayer.reset();
  }, [contentId]);

  useEffect(() => {
    refreshAudio();
  }, [refreshAudio]);

  const sendMessage = () => {
    if (!group || !group.inDevotion || loading) {
      return;
    }
    setMessage('');
    if (!message) {
      return;
    }
    client.current.sendMessage(
      JSON.stringify({ id: uuid.v4(), type: 'message', content: message })
    );
  };

  return (
    <View style={{ ...styles.container }}>
      {/* Header */}
      <Header
        config={{
          ui: {
            title: t('chat.header'),
            leftButtonImage: Theme.images.back,
            rightButtonImage: Theme.images.more
          },
          hooks: {
            onLeftButtonPress: () => {
              AppState.removeEventListener('change', changeAppStateListener);
              navigation.goBack();
            },
            onRightButtonPress: () => {
              setShowGroupSettings(true);
            }
          }
        }}
      />

      <View style={styles.content}>
        <KeyboardAvoidingView style={{ flex: 1 }}>
          <>
            {!group ? (
              <ActivityIndicator size="large" animating />
            ) : (
              chatActive && (
                <ChatWebSocket
                  initialMessage={{
                    type: 'systemMessage',
                    content: track
                      ? `${t('groups.chat.listeningToLabel')} ${track.title}`
                      : t('groups.chat.loadingTrackLabel')
                  }}
                  ref={client}
                  group={group}
                  onClose={() => {
                    AppState.removeEventListener('change', changeAppStateListener);
                    navigation.goBack();
                  }}
                  refresh={() => {
                    refresh();
                    updateAudio();
                  }}
                />
              )
            )}
          </>
        </KeyboardAvoidingView>
        <View
          style={{
            ...styles.messageBarBackground,
            paddingBottom: insets.bottom || 10
          }}
        >
          <TextInput
            editable={canSendMessage}
            style={{ ...styles.messageBar }}
            textAlign={I18Manager.isRTL() ? 'right' : 'left'}
            placeholder={t('groups.chat.inputPlaceHolder')}
            onChangeText={value => {
              setMessage(value);
            }}
            onSubmitEditing={() => {
              sendMessage();
            }}
            value={message}
          />
          <TouchableOpacity
            disabled={!canSendMessage}
            style={{ opacity: canSendMessage ? 1 : 0.5 }}
            onPress={sendMessage}
          >
            <View>
              <Image source={Theme.images.sendMessage} />
            </View>
          </TouchableOpacity>
        </View>
      </View>
      <Player
        maximizable={false}
        startMinimized
        disableControls={!isOwner}
        onUpdateAudio={async () => {
          await updateAudio();
          client.current.sendMessage(JSON.stringify({ type: 'updateAudio' }));
        }}
      />
      {group && (
        <GroupSettings
          open={showGroupSettings}
          onClose={(closeChatPage = false) => {
            setShowGroupSettings(false);
            if (closeChatPage) {
              navigation.goBack();
            }
          }}
          group={group}
          client={client}
        />
      )}
    </View>
  );
};
