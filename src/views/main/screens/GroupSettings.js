/**
 * @flow
 */

import React, { useState } from 'react';
import { Image, Modal, Text, TouchableOpacity, View, Alert } from 'react-native';
import { Header } from 'TTB/src/theme/Components';
import Theme from 'TTB/src/theme/Theme';
import EStyleSheet from 'react-native-extended-stylesheet';
import { t } from 'TTB/src/services/i18n';
import { useStore } from '../../../model/root';
import { useGroupSettings } from './GroupSettings.hooks';
import UserDirectory from './UserDirectory';
import InviteUsers from './InviteUser.modal';

const styles = EStyleSheet.create({
  participantsContainer: {
    marginLeft: 24,
    marginRight: 24,
    marginTop: 24
  },
  participantsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  participantsLabel: {
    fontFamily: 'Noto Serif',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 15,
    lineHeight: 22
  },
  participantsViewAll: {
    marginRight: 24,
    fontFamily: 'Noto Serif',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 12,
    lineHeight: 16
  },
  participantsContent: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24
  },
  participantsCard: {
    flexDirection: 'column',
    alignItems: 'center'
  },
  participantsCardName: {
    marginTop: 15,
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    letterSpacing: 0.2,
    color: '#2A324B',
    maxWidth: 80
  },
  participantsInviteNewUserContainer: {
    marginTop: 24,
    flexDirection: 'row',
    alignItems: 'center'
  },
  participantsInviteNewUserText: {
    marginLeft: 15,
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: -0.233333,
    color: '#2A324B'
  },
  devotionContainer: {
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  devotionText: {
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: 'bold',
    fontSize: 13,
    lineHeight: 18,
    color: '#424F78'
  },
  deleteButtonContainer: {
    marginLeft: 33,
    marginRight: 33,
    marginTop: 24,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#F7745B',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  deleteButtonText: {
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18,
    color: '#FFFFFF'
  }
});

const GroupSettings = ({
  open,
  onClose,
  group,
  client
}: {
  open: boolean,
  onClose: any,
  group: any,
  client: any
}) => {
  const { uiState } = useStore();
  const isOwner = group && uiState.user.id === group.owner;
  const {
    members,
    deleteGroup,
    deleteGroupMember,
    inviteGroupMembers,
    stopDevotion
  } = useGroupSettings(group);
  const [showUserDirectory, setShowUserDirectory] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  return (
    <>
      <Modal animationType="slide" visible={open}>
        <Header
          config={{
            ui: {
              title: t('chat.settings.header'),
              leftButtonImage: Theme.images.down
            },
            hooks: {
              onLeftButtonPress: () => {
                onClose();
              }
            }
          }}
        />
        <View style={{ ...styles.participantsContainer }}>
          <View style={{ ...styles.participantsHeader }}>
            <Text style={{ ...styles.participantsLabel }}>
              {t('groups.groupSettings.participantsSection')}
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowUserDirectory(true);
              }}
            >
              <Text style={{ ...styles.participantsViewAll }}>
                {t('groups.groupSettings.viewAll')}
              </Text>
            </TouchableOpacity>
          </View>
          <View style={{ ...styles.participantsContent }}>
            {members &&
              members.content.slice(0, 5).map(item => {
                return (
                  <View style={{ ...styles.participantsCard }} key={item.id}>
                    <Image source={Theme.images.avatar} />
                    <Text style={{ ...styles.participantsCardName }} numberOfLines={1}>
                      {item.username || item.email}
                    </Text>
                  </View>
                );
              })}
          </View>
          {isOwner && (
            <TouchableOpacity onPress={() => setShowInviteModal(true)}>
              <View
                style={{
                  ...styles.participantsInviteNewUserContainer
                }}
              >
                <Image source={Theme.images.addParticipants} />
                <Text
                  style={{
                    ...styles.participantsInviteNewUserText
                  }}
                >
                  {t('groups.groupSettings.invite')}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        </View>
        {isOwner && (
          <TouchableOpacity
            style={{
              ...styles.devotionContainer
            }}
            onPress={() => {
              Alert.alert(
                t('chat.settings.endDevotion.alertTitle'),
                t('chat.settings.endDevotion.alertMessage'),
                [
                  {
                    text: t('chat.settings.endDevotion.alertCancel'),
                    onPress: () => {},
                    style: 'cancel'
                  },
                  {
                    text: t('chat.settings.endDevotion.alertConfirm'),
                    onPress: async () => {
                      await stopDevotion();
                      try {
                        client.current.sendMessage(
                          JSON.stringify({ type: 'endDevotion', content: null }),
                          'events'
                        );
                      } catch (e) {
                        // eslint-disable-next-line no-empty
                      }
                      onClose(true);
                    }
                  }
                ]
              );
            }}
          >
            <Text
              style={{
                ...styles.devotionText
              }}
            >
              {t('groups.groupSettings.endDevotion')}
            </Text>
            <Image source={Theme.images.stopCircle} />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={async () => {
            if (isOwner) {
              await deleteGroup();
            } else {
              await deleteGroupMember(uiState.user.id);
            }
            onClose(true);
          }}
        >
          <View
            style={{
              ...styles.deleteButtonContainer
            }}
          >
            <Text
              style={{
                ...styles.deleteButtonText
              }}
            >
              {isOwner
                ? t('groups.groupSettings.deleteGroup')
                : t('groups.groupSettings.leaveGroup')}
            </Text>
          </View>
        </TouchableOpacity>
        <UserDirectory
          open={showUserDirectory}
          onClose={() => setShowUserDirectory(false)}
          editable={isOwner}
          group={group}
          members={members}
          deleteGroupMember={deleteGroupMember}
          client={client}
        />
        <InviteUsers
          visible={showInviteModal}
          onClose={newMembers => {
            if (newMembers && newMembers.length > 0) {
              inviteGroupMembers(newMembers.map(member => member.id));
            }
            setShowInviteModal(false);
          }}
        />
      </Modal>
    </>
  );
};

export default GroupSettings;
