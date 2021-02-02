/**
 * @flow
 */

import React, { useState } from 'react';
import { Image, Text, View, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import { Header } from 'TTB/src/theme/Components';
import Theme from 'TTB/src/theme/Theme';
import EStyleSheet from 'react-native-extended-stylesheet';
import I18Manager, { t } from 'TTB/src/services/i18n';
import { useStore } from 'TTB/src/model/root';

/* MARK: - Layout Styles */

const styles = EStyleSheet.create({
  backgroundImage: {
    width: '100%',
    position: 'absolute',
    height: '100%'
  },
  titleText: {
    color: Theme.colors.playlist.title,
    textAlign: 'center'
  },
  subtitleText: {
    fontFamily: 'NotoSans-Regular',
    fontSize: '12 rem',
    letterSpacing: 0,
    color: Theme.colors.playlist.title,
    textAlign: 'center'
  },
  container: {
    backgroundColor: 'white',
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 20
  },
  actionContainer: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    marginBottom: 22,
    marginLeft: 20,
    marginRight: 20
  },
  actionButtonContainer: {
    marginTop: 20,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch'
  },
  actionButton: {
    flex: 1
  },
  createPlayListLabel: {
    ...Theme.palette.h7,
    fontWeight: 'bold',
    color: Theme.colors.text,
    marginLeft: 20
  },
  divider: {
    height: 1,
    marginTop: 32,
    backgroundColor: Theme.colors.divider,
    marginHorizontal: 30
  },
  editButton: {
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19,
    color: '#FF8A8A'
  },
  subjectSectionLabel: {
    marginHorizontal: 30,
    marginTop: 20,
    flexDirection: 'row'
  },
  subjectSectionLabelText: {
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.575,
    color: '#424F78',
    alignSelf: 'center'
  },
  subjectTextInput: {
    marginTop: 10,
    marginHorizontal: 30,
    fontSize: 16,
    lineHeight: 22,
    color: '#2A324B'
  },
  descriptionSectionLabel: {
    marginHorizontal: 30,
    marginTop: 20,
    flexDirection: 'row'
  },
  descriptionSectionLabelText: {
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.575,
    color: '#424F78',
    alignSelf: 'center'
  },
  descriptionTextInput: {
    marginTop: 10,
    marginHorizontal: 30,
    fontSize: 16,
    lineHeight: 22,
    color: '#2A324B'
  }
});

/* MARK: - UI Components */

const ReportBug = () => {
  const navigation = useNavigation();
  const { settingsState } = useStore();
  const [subjectText, setSubjectText] = useState('');
  const [bodyText, setBodyText] = useState('');

  return (
    <View style={{ flex: 1 }}>
      {/* Background Image */}
      <Image style={{ ...Theme.palette.topRightOval }} source={Theme.images.cornerOval} />

      {/* Header */}
      <Header
        config={{
          ui: {
            title: t('settings.profile.reportBug.header'),
            leftButtonImage: Theme.images.back,
            rightButtonContent: (
              <Text style={{ ...styles.editButton }}>{t('settings.profile.reportBug.send')}</Text>
            )
          },
          hooks: {
            onLeftButtonPress: () => navigation.goBack(),
            onRightButtonPress: async () => {
              try {
                await settingsState.sendReport(subjectText, bodyText);
                Alert.alert(t('settings.profile.reportBug.successAlert'));
                navigation.goBack();
              } catch {
                Alert.alert(t('settings.profile.reportBug.failedAlert'));
              }
            }
          }
        }}
      />

      <ScrollView>
        <View style={{ ...styles.subjectSectionLabel }}>
          <Text style={{ ...styles.subjectSectionLabelText }}>
            {t('settings.profile.reportBug.subject')}
          </Text>
        </View>
        <TextInput
          style={{ ...styles.subjectTextInput }}
          textAlign={I18Manager.isRTL() ? 'right' : 'left'}
          value={subjectText}
          onChangeText={text => setSubjectText(text)}
          placeholder={t('settings.profile.reportBug.subjectPlaceHolder')}
          placeholderTextColor="#5E6C84"
          maxLength={50}
          autoFocus
        />
        <View style={{ ...styles.divider }} />
        <View style={{ ...styles.descriptionSectionLabel }}>
          <Text style={{ ...styles.descriptionSectionLabelText }}>
            {t('settings.profile.reportBug.description')}
          </Text>
        </View>
        <TextInput
          style={{ ...styles.descriptionTextInput }}
          textAlign={I18Manager.isRTL() ? 'right' : 'left'}
          value={bodyText}
          onChangeText={text => setBodyText(text)}
          placeholder={t('settings.profile.reportBug.descriptionPlaceHolder')}
          placeholderTextColor="#5E6C84"
          multiline
          maxLength={500}
        />
      </ScrollView>
    </View>
  );
};

export default ReportBug;
