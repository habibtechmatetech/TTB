/**
 * @flow
 */

import React, { useState } from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Modal, Text, TouchableOpacity, View, FlatList, Image } from 'react-native';
import { SwipeRow } from 'react-native-swipe-list-view';
import { Header } from 'TTB/src/theme/Components';
import Theme from 'TTB/src/theme/Theme';
import _ from 'lodash';
import { t } from 'TTB/src/services/i18n';

const styles = EStyleSheet.create({
  flatList: {
    backgroundColor: '#F2F2F2'
  },
  itemContainer: {
    marginTop: 15
  },
  swipeRowRemoveButtonContainer: {
    width: 108,
    height: 70,
    alignSelf: 'flex-end',
    backgroundColor: 'white'
  },
  swipeRowRemoveButton: {
    padding: 14,
    marginTop: 10,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    backgroundColor: Theme.colors.delete,
    width: 108,
    borderTopLeftRadius: 35,
    borderBottomLeftRadius: 35
  },
  swipeRowRemoveButtonText: {
    fontSize: '14 rem',
    color: '#FFFFFF',
    letterSpacing: 0,
    lineHeight: 21
  },
  swipeRowContainer: {
    padding: 14,
    marginLeft: 23,
    height: 70,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
    backgroundColor: 'white',
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12
  },
  swipeRowText: {
    marginLeft: 15,
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
    color: '#2A324B'
  },
  editButton: {
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19,
    color: '#FF8A8A'
  }
});

export const Item = ({
  editable,
  member,
  onDelete
}: {
  editable: boolean,
  member: any,
  onDelete: any
}) => {
  return (
    <View
      style={{
        ...styles.itemContainer
      }}
    >
      <SwipeRow
        rightOpenValue={-108}
        stopRightSwipe={-108}
        disableLeftSwipe={!editable}
        disableRightSwipe
      >
        <View
          style={{
            ...styles.swipeRowRemoveButtonContainer
          }}
        >
          <View style={{ ...styles.swipeRowRemoveButton }}>
            <TouchableOpacity onPress={() => onDelete(member)}>
              <Text style={{ ...styles.swipeRowRemoveButtonText }}>
                {t('groups.userDirectory.remove')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={{ ...styles.swipeRowContainer }}>
          <Image source={Theme.images.menu.avatar} />
          <Text style={{ ...styles.swipeRowText }}>
            {member.username
              ? member.username
              : `${t('groups.userDirectory.anonymous')} ${member.id}`}
          </Text>
        </View>
      </SwipeRow>
    </View>
  );
};

const UserDirectory = ({
  open,
  onClose,
  editable,
  group,
  members,
  deleteGroupMember,
  client
}: {
  open: any,
  onClose: any,
  editable: boolean,
  group: any,
  members: any,
  deleteGroupMember: any,
  client: any
}) => {
  const [membersToDelete, setMembersToDelete] = useState([]);
  const membersToDisplay = _.differenceBy(
    members ? members.content : [],
    membersToDelete,
    item => item.id
  );

  return (
    <Modal animationType="slide" visible={open}>
      <Header
        config={{
          ui: {
            title: t('groups.userDirectory.header'),
            leftButtonImage: Theme.images.down,
            rightButtonContent: editable ? (
              <Text style={{ ...styles.editButton }}>{t('groups.userDirectory.send')}</Text>
            ) : null
          },
          hooks: {
            onLeftButtonPress: () => {
              setMembersToDelete([]);
              onClose();
            },
            onRightButtonPress: async () => {
              setMembersToDelete([]);
              // eslint-disable-next-line no-restricted-syntax
              for (const item of membersToDelete) {
                // eslint-disable-next-line no-await-in-loop
                await deleteGroupMember(item.id);
              }
              client.current.sendMessage(
                JSON.stringify({
                  type: 'userDirectoryUpdate',
                  content: membersToDelete.map(item => item.id)
                })
              );
              onClose();
            }
          }
        }}
      />
      <FlatList
        style={{ ...styles.flatList }}
        data={membersToDisplay}
        renderItem={({ item }) => {
          return (
            <Item
              editable={editable && item.id !== group.owner}
              member={item}
              onDelete={memberToDelete => {
                setMembersToDelete([...membersToDelete, memberToDelete]);
              }}
            />
          );
        }}
        keyExtractor={item => item.id}
      />
    </Modal>
  );
};

export default UserDirectory;
