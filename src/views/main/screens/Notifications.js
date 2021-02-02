/**
 * @flow
 */

import React, { useState, useEffect } from 'react';
import { t } from 'TTB/src/services/i18n';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useStore } from 'TTB/src/model/root';
import { useNavigation } from 'react-navigation-hooks';
import { observer } from 'mobx-react';

const styles = EStyleSheet.create({
  container: {
    marginTop: 32,
    marginLeft: 20,
    flexDirection: 'row'
  },
  sectionLabel: {
    fontFamily: 'Noto Serif',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
    color: '#161B25'
  },
  itemLabel: {
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18,
    color: '#424F78'
  },
  switchItemContainer: {
    marginTop: 32,
    marginLeft: 20,
    marginRight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  buttonContainer: {
    marginLeft: 33,
    marginRight: 33,
    marginTop: 24,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#006FA1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  buttonText: {
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18,
    color: '#FFFFFF'
  }
});

const keys = ['INVITED_TO_GROUP', 'INVITED_TO_DEVOTION', 'SUCCESSFUL_P2P_TRANSFER'];

const Notifications = () => {
  const navigation = useNavigation();
  const { uiState, settingsState } = useStore();
  const [switchOn, setSwitchOn] = useState([]);

  const getArray = arr => {
    return arr.map((item, index) => (item ? keys[index] : null)).filter(item => item !== null);
  };

  useEffect(() => {
    const arr =
      settingsState.settingsProfile && settingsState.settingsProfile.notifications
        ? settingsState.settingsProfile.notifications
        : [];
    setSwitchOn(keys.map(key => arr.includes(key)));
  }, [settingsState.settingsProfile]);

  const SwitchItem = ({ index }: { index: any }) => {
    return (
      <View style={{ ...styles.switchItemContainer }}>
        <Text style={{ ...styles.itemLabel }}>
          {index === 0 && t('settings.notifications.groupInvitation')}
          {index === 1 && t('settings.notifications.devotions')}
          {index === 2 && t('settings.notifications.file')}
        </Text>
        <Switch
          value={switchOn[index]}
          onValueChange={() => {
            const newSwitchOn = switchOn.map((item, ind) => (ind === index ? !item : item));
            setSwitchOn(newSwitchOn);
            const newProfile = {
              ...settingsState.settingsProfile,
              notifications: getArray(newSwitchOn)
            };
            settingsState.updateSettingsProfile(newProfile);
          }}
        />
      </View>
    );
  };

  return (
    <ScrollView>
      {uiState.isAuthenticated && (
        <>
          <View style={{ ...styles.container }}>
            <Text style={{ ...styles.sectionLabel }}>
              {t('settings.notifications.notifications')}
            </Text>
          </View>
          <SwitchItem index={0} />
          <SwitchItem index={1} />
          <SwitchItem index={2} />
        </>
      )}
      {!uiState.isAuthenticated && (
        <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
          <View style={{ ...styles.buttonContainer }}>
            <Text style={{ ...styles.buttonText }}>{t('signIn.header')}</Text>
          </View>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
};

export default observer(Notifications);
