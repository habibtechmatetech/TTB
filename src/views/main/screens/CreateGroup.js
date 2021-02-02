/**
 * @flow
 */

import React, { useState } from 'react';
import { Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Input } from 'react-native-elements';
import { Button } from 'TTB/src/theme/Components';
import Theme from 'TTB/src/theme/Theme';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useSafeArea } from 'react-native-safe-area-context';
import _ from 'lodash';
import I18Manager, { t } from 'TTB/src/services/i18n';
import InviteUsers from './InviteUser.modal';
import { Item } from './UserDirectory';

/* MARK: - Layout Styles */
const layoutStyles = EStyleSheet.create({
  scrollView: {
    marginLeft: 20,
    marginRight: 20
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  header: {
    height: 41,
    borderRadius: 6,
    backgroundColor: Theme.colors.uiField,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10
  },
  headerText: {
    height: 22,
    color: Theme.colors.text,
    fontFamily: 'Noto Sans',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.87,
    lineHeight: 22
  },
  activeHeader: {
    height: 40,
    borderRadius: 6,
    backgroundColor: '#063D62',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10
  },
  title: {},
  chapterButton: {
    margin: 5,
    padding: 5,
    width: 42,
    height: 42,
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 21
  },
  createGroupInput: {
    paddingTop: 20
  },
  createGroupInputSectionLabelContainer: {
    flexDirection: 'row'
  },
  createGroupTitles: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    color: '#161B25',
    alignSelf: 'center'
  },
  subtitleText: {
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18,
    color: '#424F78',
    paddingTop: 10,
    paddingBottom: 10
  },
  signInButtonContainer: {
    justifyContent: 'center',
    flex: 25
  },
  item: {
    backgroundColor: 'white',
    flexDirection: 'row',
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
    }
  },
  titleText: {
    fontFamily: 'Noto Sans',
    fontWeight: 'bold',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
    color: '#2A324B',
    paddingHorizontal: 20
  }
});

export default ({
  open,
  onClose,
  onCreateGroup
}: {
  open: boolean,
  onClose: any,
  onCreateGroup: any
}) => {
  const insets = useSafeArea();
  const isEnabledPrivacy = false;
  const isEnabledApproval = false;
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteMembers, setInviteMembers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<?string>();
  const groupData = {};

  return (
    <Modal animationType="slide" transparent onRequestClose={onClose} visible={open}>
      <View
        style={{
          flex: 1,
          backgroundColor: Theme.colors.modal.background,
          flexDirection: 'column-reverse'
        }}
      >
        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'stretch',
              display: 'flex',
              width: '100%',
              alignSelf: 'flex-end',
              backgroundColor: Theme.colors.player.background,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              maxHeight: '90%'
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                margin: 20
              }}
            >
              <Text
                style={{
                  fontWeight: '600',
                  fontSize: 13,
                  lineHeight: 18,
                  color: '#424F78'
                }}
              >
                {t('groups.createGroup.title')}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Image source={Theme.images.closeX} />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'stretch'
              }}
            >
              <ScrollView
                style={layoutStyles.scrollView}
                contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
              >
                <View style={{ ...layoutStyles.fieldsContainer }}>
                  <View style={{ ...layoutStyles.createGroupInput }}>
                    <View style={{ ...layoutStyles.createGroupInputSectionLabelContainer }}>
                      <Text
                        style={{
                          fontWeight: '500',
                          fontSize: 11,
                          lineHeight: 15,
                          letterSpacing: 0.575,
                          color: '#424F78',
                          alignSelf: 'center'
                        }}
                      >
                        {t('groups.createGroup.groupNameLabel')}
                      </Text>
                    </View>
                    <Input
                      style={{
                        fontSize: 16,
                        lineHeight: 22,
                        color: '#2A324B'
                      }}
                      textAlign={I18Manager.isRTL() ? 'right' : 'left'}
                      placeholder={t('groups.createGroup.groupNameInputPlaceHolder')}
                      errorStyle={{ color: 'red' }}
                      errorMessage={error}
                      onChange={({ nativeEvent: { text } }) => {
                        setGroupName(text);
                      }}
                      onSubmitEditing={({ nativeEvent: { text } }) => {
                        setGroupName(text);
                      }}
                    />
                  </View>

                  <View style={{ ...layoutStyles.createGroupInput }}>
                    <View style={{ ...layoutStyles.createGroupInputSectionLabelContainer }}>
                      <Text
                        style={{
                          fontWeight: '500',
                          fontSize: 11,
                          lineHeight: 15,
                          letterSpacing: 0.575,
                          color: '#424F78',
                          alignSelf: 'center'
                        }}
                      >
                        {t('groups.createGroup.descriptionLabel')}
                      </Text>
                    </View>
                    <Input
                      style={{
                        fontSize: 16,
                        lineHeight: 22,
                        color: '#2A324B',
                        opacity: 0.5
                      }}
                      textAlign={I18Manager.isRTL() ? 'right' : 'left'}
                      placeholder={t('groups.createGroup.descriptionInputPlaceHolder')}
                      onSubmitEditing={({ nativeEvent: { text } }) => {
                        setDescription(text);
                      }}
                    />
                  </View>

                  <View style={{ ...layoutStyles.createGroupInput }}>
                    <View style={{ ...layoutStyles.createGroupInputSectionLabelContainer }}>
                      <Text style={{ ...layoutStyles.createGroupTitles }}>
                        {t('groups.createGroup.inviteLabel')}
                      </Text>
                    </View>
                    {inviteMembers
                      ? inviteMembers.map(member => (
                          <Item
                            editable
                            member={member}
                            onDelete={memberToDelete => {
                              const newSelected = inviteMembers.filter(
                                item => item !== memberToDelete
                              );
                              setInviteMembers(newSelected);
                            }}
                          />
                        ))
                      : null}
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View>
                        <TouchableOpacity
                          style={{ padding: 15 }}
                          onPress={() => {
                            setShowInviteModal(true);
                          }}
                        >
                          <View>
                            <Image source={Theme.images.addParticipants} />
                          </View>
                        </TouchableOpacity>
                      </View>
                      <Text style={{ ...layoutStyles.subtitleText }}>
                        {t('groups.createGroup.inviteButton')}
                      </Text>
                    </View>
                  </View>

                  <View style={{ ...layoutStyles.signInButtonContainer }}>
                    <Button
                      title={t('groups.createGroup.button')}
                      onPress={() => {
                        groupData.name = groupName;
                        groupData.description = description;
                        groupData.privacy = isEnabledPrivacy;
                        groupData.approval = isEnabledApproval;
                        groupData.members = inviteMembers.map(item => item.id);

                        if (groupData.name.length > 25) {
                          setError(t('groups.createGroup.groupNameTooLong'));
                          return;
                        }
                        if (groupData.name.length < 3) {
                          setError(t('groups.createGroup.invalidGroupName'));
                          return;
                        }
                        setError(null);
                        onCreateGroup(groupData);
                        onClose();
                      }}
                    />
                  </View>

                  <InviteUsers
                    visible={showInviteModal}
                    onClose={newMembers => {
                      if (newMembers && newMembers.length > 0) {
                        setInviteMembers(
                          _.uniqBy([...inviteMembers, ...newMembers], member => member.id)
                        );
                      }
                      setShowInviteModal(false);
                    }}
                  />
                </View>
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
