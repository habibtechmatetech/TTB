/**
 * @flow
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, Linking, Alert } from 'react-native';
import Theme from 'TTB/src/theme/Theme';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useNavigation } from 'react-navigation-hooks';
import { t } from 'TTB/src/services/i18n';
import { useStore } from 'TTB/src/model/root';
import DeviceInfo from 'react-native-device-info';
import { observer } from 'mobx-react';
import Constants from 'TTB/src/constants';
import { TutorialOnboarding } from '../../initial-flow/screens/TutorialOnboarding';

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
  subItemLabel: {
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 11,
    lineHeight: 15,
    color: '#2A324B'
  },
  infoLabel: {
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 19,
    color: '#2A324B',
    opacity: 0.5
  },
  editButton: {
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 14,
    lineHeight: 19,
    color: '#FF8A8A'
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
  },
  hollowButtonContainer: {
    marginTop: '7%',
    marginLeft: '20%',
    marginRight: '20%',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#006FA1',
    borderRadius: 25
  },
  hollowButtonText: {
    marginLeft: 30,
    marginRight: 30,
    marginTop: 12,
    marginBottom: 12,
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 11,
    lineHeight: 15,
    textAlign: 'center',
    color: '#006FA1'
  },
  divider: {
    height: 1,
    marginTop: 32,
    backgroundColor: Theme.colors.divider
  },
  usernameItemContainer: {
    marginTop: 10,
    marginLeft: 20,
    marginRight: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  emailItemContainer: {
    marginTop: 10,
    marginLeft: 20,
    marginRight: 31,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  arrowItemContainer: {
    marginTop: 32,
    marginLeft: 20,
    marginRight: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  versionItemContainer: {
    marginTop: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  }
});

const Profile = () => {
  const navigation = useNavigation();
  const { uiState, favoritesState, playlistsState, settingsState } = useStore();
  const [tutorial, setTutorial] = useState(false);

  return (
    <>
      <ScrollView>
        {/* Account */}
        {uiState.isAuthenticated && (
          <>
            <View style={{ ...styles.container }}>
              <Text style={{ ...styles.sectionLabel }}>{t('settings.profile.account')}</Text>
            </View>
            <View style={{ ...styles.container }}>
              <Text style={{ ...styles.subItemLabel }}>{t('settings.profile.username')}</Text>
            </View>
            <View style={{ ...styles.usernameItemContainer }}>
              <Text style={{ ...styles.infoLabel }}>
                {settingsState.settingsProfile && settingsState.settingsProfile.username
                  ? settingsState.settingsProfile.username
                  : ''}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Edit', {
                    title: t('settings.profile.edit.username.header'),
                    value:
                      settingsState.settingsProfile && settingsState.settingsProfile.username
                        ? settingsState.settingsProfile.username
                        : '',
                    onSave: async username => {
                      try {
                        await settingsState.updateSettingsProfile({
                          ...settingsState.settingsProfile,
                          username
                        });
                        Alert.alert(t('settings.profile.edit.username.successAlert'));
                      } catch {
                        Alert.alert(t('settings.profile.edit.username.failedAlert'));
                      }
                    }
                  });
                }}
              >
                <Text style={{ ...styles.editButton }}>{t('settings.profile.editButton')}</Text>
              </TouchableOpacity>
            </View>
            <View style={{ ...styles.container }}>
              <Text style={{ ...styles.subItemLabel }}>{t('settings.profile.email')}</Text>
            </View>
            <View style={{ ...styles.emailItemContainer }}>
              <Text style={{ ...styles.infoLabel }}>
                {settingsState.settingsProfile && settingsState.settingsProfile.email
                  ? settingsState.settingsProfile.email
                  : ''}
              </Text>
              <TouchableOpacity
                onPress={() => {
                  navigation.navigate('Edit', {
                    title: t('settings.profile.edit.email.header'),
                    value:
                      settingsState.settingsProfile && settingsState.settingsProfile.email
                        ? settingsState.settingsProfile.email
                        : '',
                    onSave: async email => {
                      try {
                        await settingsState.updateSettingsProfile({
                          ...settingsState.settingsProfile,
                          email
                        });
                        uiState.user.email = email;
                        Alert.alert(t('settings.profile.edit.email.successAlert'));
                      } catch {
                        Alert.alert(t('settings.profile.edit.email.failedAlert'));
                      }
                    }
                  });
                }}
              >
                <Text style={{ ...styles.editButton }}>{t('settings.profile.editButton')}</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
        {!uiState.isAuthenticated && (
          <TouchableOpacity onPress={() => navigation.navigate('SignIn')}>
            <View style={{ ...styles.buttonContainer }}>
              <Text style={{ ...styles.buttonText }}>{t('settings.profile.signIn')}</Text>
            </View>
          </TouchableOpacity>
        )}
        {uiState.isAuthenticated && (
          <TouchableOpacity
            onPress={() => {
              uiState.signOut();
              favoritesState.signOut();
              playlistsState.signOut();
              settingsState.signOut();
              navigation.navigate('Teachings');
            }}
          >
            <View style={{ ...styles.buttonContainer }}>
              <Text style={{ ...styles.buttonText }}>{t('settings.profile.signOut')}</Text>
            </View>
          </TouchableOpacity>
        )}
        <View style={{ ...styles.divider }} />

        <TouchableOpacity onPress={() => navigation.navigate('Language')}>
          <View style={{ ...styles.arrowItemContainer }}>
            <Text style={{ ...styles.itemLabel }}>{t('settings.profile.languages')}</Text>
            <Image source={Theme.images.right} />
          </View>
        </TouchableOpacity>
        <View style={{ ...styles.divider }} />

        {/* Legal */}
        <View style={{ ...styles.container }}>
          <Text style={{ ...styles.sectionLabel }}>{t('settings.profile.legal')}</Text>
        </View>
        <TouchableOpacity
          onPress={async () => {
            const url = Constants.TERMS_URL;
            if (await Linking.canOpenURL(url)) {
              await Linking.openURL(url);
            }
          }}
        >
          <View style={{ ...styles.arrowItemContainer }}>
            <Text style={{ ...styles.itemLabel }}>{t('settings.profile.termsConditions')}</Text>
            <Image source={Theme.images.down} />
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={async () => {
            const url = Constants.PRIVACY_URL;
            if (await Linking.canOpenURL(url)) {
              await Linking.openURL(url);
            }
          }}
        >
          <View style={{ ...styles.arrowItemContainer }}>
            <Text style={{ ...styles.itemLabel }}>{t('settings.profile.privacyPolicy')}</Text>
            <Image source={Theme.images.down} />
          </View>
        </TouchableOpacity>
        <View style={{ ...styles.divider }} />

        {/* Support */}
        <View style={{ ...styles.container }}>
          <Text style={{ ...styles.sectionLabel }}>{t('settings.profile.support')}</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ReportBug')}>
          <View style={{ ...styles.hollowButtonContainer }}>
            <Text style={{ ...styles.hollowButtonText }}>
              {t('settings.profile.reportAProblem')}
            </Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setTutorial(true);
          }}
        >
          <View style={{ ...styles.hollowButtonContainer }}>
            <Text style={{ ...styles.hollowButtonText }}>{t('settings.profile.tutorial')}</Text>
          </View>
        </TouchableOpacity>
        <TutorialOnboarding show={tutorial} close={setTutorial} />
        <View style={{ ...styles.versionItemContainer }}>
          <Text style={{ ...styles.subItemLabel }}>
            {`${t(
              'settings.profile.version'
            )} ${DeviceInfo.getVersion()} (${DeviceInfo.getBuildNumber()})`}
          </Text>
        </View>
        <View style={{ ...styles.divider }} />
      </ScrollView>
    </>
  );
};

export default observer(Profile);
