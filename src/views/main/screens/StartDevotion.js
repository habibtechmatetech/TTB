/**
 * @flow
 */

import React, { useRef } from 'react';
import { View, Text, Alert } from 'react-native';
import { Observer } from 'mobx-react';
import MediaList from 'TTB/src/theme/Components.mediaList';
import { t } from 'TTB/src/services/i18n';
import { useStore } from 'TTB/src/model/root';
import { useNavigation } from 'react-navigation-hooks';
import { NavigationActions } from 'react-navigation';
import SockJsClient from 'react-stomp';
import Constants from 'TTB/src/constants';
import type { Audio } from '../../../lib/types';
import { useGroups } from './Groups.hooks';
import { ActionModal } from '../../../theme/Components.modal';
import GroupsManager from '../../../services/groups';
import AuthManager from '../../../services/auth';

export default ({ track, show, close }: { track: Audio, show: boolean, close: any }) => {
  const navigation = useNavigation();
  const { uiState } = useStore();
  const { loading, refresh, groups } = useGroups(uiState.user && uiState.user.id, true, true);
  const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
  const client = useRef({ connection: null });
  return (
    <Observer>
      {() => (
        <ActionModal title={t('modal.startDevotion.title')} show={show} close={() => close()}>
          <SockJsClient
            url={`${Constants.REST_API_URL_USERS}/discussion`}
            headers={headers}
            subscribeHeaders={headers}
            topics={groups ? groups.map(item => `/events/${item.id}`) : []}
            onConnect={() => {}}
            onDisconnect={() => {}}
            onConnectFailure={error => {
              // eslint-disable-next-line no-console
              console.log(error);
            }}
            onMessage={() => {}}
            ref={socketClient => {
              client.current.connection = socketClient;
            }}
          />
          <View style={{ flex: 0.75 }}>
            {!loading && groups && groups.length === 0 && (
              <Text style={{ textAlign: 'center' }}>
                You have not created any groups to share with yet
              </Text>
            )}
            <MediaList
              data={groups}
              onSelectItem={async item => {
                Alert.alert(
                  t('startDevotion.alertTitle'),
                  t('startDevotion.alertMessage', { name: item.name }),
                  [
                    {
                      text: t('startDevotion.alertCancel'),
                      onPress: () => {},
                      style: 'cancel'
                    },
                    {
                      text: t('startDevotion.alertConfirm'),
                      onPress: async () => {
                        try {
                          client.current.connection.sendMessage(
                            `/events/${item.id}`,
                            JSON.stringify({
                              type: 'startDevotion',
                              username: uiState.user.email,
                              content: { group: item }
                            }),
                            { ...headers }
                          );
                          await GroupsManager.startDevotion(item.id, track.contentId);
                          navigation.navigate(
                            'Groups',
                            {},
                            NavigationActions.navigate({
                              routeName: 'Chat',
                              params: { group: item }
                            })
                          );
                          close(true);
                        } catch (e) {
                          close(false);
                        }
                      }
                    }
                  ]
                );
              }}
              onRefresh={refresh}
              refreshing={loading}
            />
          </View>
        </ActionModal>
      )}
    </Observer>
  );
};
