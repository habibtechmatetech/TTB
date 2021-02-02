/**
 * @flow
 */

import React, { useState } from 'react';
import { Image, Text, View, ScrollView, TextInput } from 'react-native';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { Header } from 'TTB/src/theme/Components';
import Theme from 'TTB/src/theme/Theme';
import EStyleSheet from 'react-native-extended-stylesheet';
import I18Manager, { t } from 'TTB/src/services/i18n';

/* MARK: - Layout Styles */

const styles = EStyleSheet.create({
  editButton: {
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19,
    color: '#FF8A8A'
  },
  textInput: {
    marginTop: 10,
    marginHorizontal: 30,
    fontSize: 16,
    lineHeight: 22,
    color: '#2A324B'
  }
});

/* MARK: - UI Components */

const Edit = () => {
  const navigation = useNavigation();
  const title = useNavigationParam('title');
  const value = useNavigationParam('value');
  const onSave = useNavigationParam('onSave');
  const [text, setText] = useState(value);

  return (
    <View style={{ flex: 1 }}>
      {/* Background Image */}
      <Image style={{ ...Theme.palette.topRightOval }} source={Theme.images.cornerOval} />

      {/* Header */}
      <Header
        config={{
          ui: {
            title,
            leftButtonImage: Theme.images.back,
            rightButtonContent: (
              <Text style={{ ...styles.editButton }}>{t('settings.profile.edit.save')}</Text>
            )
          },
          hooks: {
            onLeftButtonPress: () => navigation.goBack(),
            onRightButtonPress: () => {
              onSave(text);
              navigation.goBack();
            }
          }
        }}
      />

      <ScrollView>
        <TextInput
          style={{ ...styles.textInput }}
          textAlign={I18Manager.isRTL() ? 'right' : 'left'}
          value={text}
          onChangeText={v => setText(v)}
          placeholderTextColor="#5E6C84"
          autoFocus
        />
      </ScrollView>
    </View>
  );
};

export default Edit;
