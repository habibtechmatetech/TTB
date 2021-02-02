/**
 * @flow
 */

import React, { useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { Header, CheckBox, Input } from 'TTB/src/theme/Components';
import { t } from 'TTB/src/services/i18n';
import Theme from 'TTB/src/theme/Theme';
import EStyleSheet from 'react-native-extended-stylesheet';
import { FlatList } from 'react-native-gesture-handler';
import { useSearch } from './Groups.hooks';

/* MARK: - Layout Styles */
const layoutStyles = EStyleSheet.create({
  createGroupInput: {
    paddingTop: 20
  },
  createGroupTitles: {
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    color: '#161B25'
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
  groupList: {
    paddingBottom: 20
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

export default ({ visible, onClose }: { visible: boolean, onClose: any }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [searchText, setSearchText] = useState<string>('');
  const { loading, members } = useSearch(searchText);

  const close = () => {
    onClose(selectedItems);
    setSelectedItems([]);
  };

  return (
    <Modal animationType="slide" onRequestClose={close} visible={visible}>
      <Header
        config={{
          ui: {
            title: t('inviteUsers.header'),
            leftButtonImage: Theme.images.down,
            rightButtonContent: (
              <Text
                style={{
                  fontWeight: '500',
                  fontSize: 16,
                  lineHeight: 22,
                  color: '#FF8A8A'
                }}
              >
                {t('groups.inviteUser.send')}
              </Text>
            )
          },
          hooks: {
            onLeftButtonPress: onClose,
            onRightButtonPress: close
          }
        }}
      />
      <View
        style={{
          padding: 20
        }}
      >
        <Input
          style={{
            fontSize: 14,
            lineHeight: 16,
            color: '#5E6C84'
          }}
          placeholder={t('groups.inviteUser.placeHolder')}
          autoCapitalize="none"
          onSubmitEditing={({ nativeEvent: { text } }) => {
            setSearchText(text);
          }}
        />
      </View>
      <FlatList
        onRefresh={() => {}}
        refreshing={loading}
        contentContainerStyle={layoutStyles.groupList}
        data={members}
        keyExtractor={item => item.id}
        renderItem={({ item }) => {
          const selected = selectedItems.some(selectedItem => selectedItem.id === item.id);
          return (
            <View style={layoutStyles.item}>
              <CheckBox
                checked={selected}
                onPress={() => {
                  if (selected) {
                    setSelectedItems(
                      selectedItems.filter(selectedItem => selectedItem.id !== item.id)
                    );
                  } else {
                    setSelectedItems([...selectedItems, item]);
                  }
                }}
              />
              <Text style={layoutStyles.titleText}>{item.username || item.email}</Text>
            </View>
          );
        }}
      />
    </Modal>
  );
};
