/**
 * @flow
 */
import { useSafeArea } from 'react-native-safe-area-context';
import React, { useState, useCallback } from 'react';
import { Image, Text, TouchableOpacity, View, FlatList, Alert } from 'react-native';
import { useNavigation, useFocusEffect } from 'react-navigation-hooks';
import { Header } from 'TTB/src/theme/Components';
import { t } from 'TTB/src/services/i18n';
import Theme from 'TTB/src/theme/Theme';
import EStyleSheet from 'react-native-extended-stylesheet';
import SockJsClient from 'react-stomp';
import Constants from 'TTB/src/constants';
import { useStore } from 'TTB/src/model/root';
import { useGroups } from './Groups.hooks';
import colors from '../../../theme/colors';
import CreateGroup from './CreateGroup';
import AuthManager from '../../../services/auth';

/* MARK: - Layout Styles */

const styles = EStyleSheet.create({
  content: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  item: {
    backgroundColor: 'white',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  textContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  titleText: {
    fontFamily: 'Noto Serif',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
    color: '#161B25'
  },
  groupList: {
    paddingBottom: 20
  },
  createButton: {
    bottom: 10,
    width: '100%',
    position: 'absolute',
    flexDirection: 'row',
    justifyContent: 'center'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'stretch',
    backgroundColor: colors.background
  },
  subtitleMembers: {
    fontFamily: 'Noto Sans',
    fontSize: 12,
    lineHeight: 16,
    color: '#424F78',
    opacity: 0.5
  },
  redDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red'
  },
  greenDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'green'
  }
});

function Item(group) {
  return (
    <View style={styles.item}>
      <View style={styles.textContainer}>
        <Text style={styles.titleText}>{group.group.name}</Text>
        <Text style={styles.subtitleMembers}>
          {group.group.membersCount} {t('groups.membersLabel')}
        </Text>
      </View>
      <View style={group.group.inDevotion ? styles.greenDot : styles.redDot} />
    </View>
  );
}

export default () => {
  // /* Hooks */
  const navigation = useNavigation();
  const { uiState, groupsState } = useStore();
  const { groups, loading, refresh, createGroup } = useGroups(uiState.user.id);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const insets = useSafeArea();
  const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };

  useFocusEffect(
    useCallback(() => {
      refresh();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <Header
        config={{
          ui: {
            title: t('groups.header'),
            leftButtonImage: Theme.images.menu.hamburger
          },
          hooks: {
            onLeftButtonPress: navigation.toggleDrawer
          }
        }}
      />
      <FlatList
        onRefresh={() => refresh()}
        refreshing={loading}
        contentContainerStyle={{ ...styles.groupList, paddingBottom: insets.bottom + 84 }}
        data={groups}
        keyExtractor={item => `${item.id}`}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              if (!item.inDevotion) {
                Alert.alert(t('groups.devotionNotStartAlert'));
              } else {
                navigation.navigate('Chat', { group: item });
              }
            }}
          >
            <Item group={item} />
          </TouchableOpacity>
        )}
      />
      <View style={{ ...styles.createButton, marginBottom: insets.bottom }}>
        <TouchableOpacity onPress={() => setShowCreateGroup(true)}>
          <View>
            <Image source={Theme.images.primary} />
          </View>
        </TouchableOpacity>
      </View>
      <CreateGroup
        onCreateGroup={createGroup}
        open={showCreateGroup}
        onClose={() => {
          setShowCreateGroup(false);
        }}
      />
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
        onMessage={message => {
          if (message.type === 'startDevotion') {
            if (uiState.user.email !== message.username) {
              groupsState.group = message.content.group;
              groupsState.showDevotionModal = true;
            }
            refresh();
          }
          if (message.type === 'endDevotion') {
            refresh();
          }
        }}
      />
    </View>
  );
};
