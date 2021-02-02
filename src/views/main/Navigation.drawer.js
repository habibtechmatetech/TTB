/**
 * @flow
 */

import * as React from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import { ScrollView, Image, View, Text, TouchableHighlight, Modal } from 'react-native';
import { Divider } from 'react-native-elements';
import { DrawerActions, createDrawerNavigator } from 'react-navigation-drawer';
import { Observer } from 'mobx-react';
import { useStore } from 'TTB/src/model/root';
import I18nManager, { t } from 'TTB/src/services/i18n';
import Theme from 'TTB/src/theme/Theme';
import { DecisionModal } from 'TTB/src/theme/Components.modal';
import AuthStack from 'TTB/src/views/auth/Navigation';
import Teachings from 'TTB/src/views/main/screens/Teachings.navigation';
import Bible from 'TTB/src/views/main/screens/Bible.navigation';
import Library from 'TTB/src/views/main/screens/Library.navigation';
import Groups from 'TTB/src/views/main/screens/Groups.navigation';
import Settings from 'TTB/src/views/main/screens/Settings.navigation';
import P2PSharing from 'TTB/src/views/sharing/Navigation';
import { useNavigationAuthActions } from './Navigation.drawer.hooks';
import SelectLanguage from '../initial-flow/screens/SelectLanguage';
import Onboarding from '../initial-flow/screens/Onboarding.navigation';

/* MARK: - Layout Styles */

const layoutStyles = EStyleSheet.create({
  background: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    backgroundColor: Theme.colors.menuBackground
  },
  backgroundImage: {
    position: 'absolute',
    aspectRatio: 167 / 731,
    right: 0
  },
  content: {
    height: '100%',
    width: '100%',
    paddingTop: '25%',
    marginBottom: '125 rem',
    position: 'absolute',
    paddingHorizontal: '10%'
  },
  container: {
    width: '100%',
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  avatarImage: {
    aspectRatio: 1
  },
  userInfo: {
    flexDirection: 'column',
    flex: 1,
    paddingHorizontal: '6%',
    alignItems: 'flex-start'
  },
  userInfoHeader: {
    fontSize: '14 rem',
    lineHeight: '19 rem',
    fontFamily: 'NotoSans-Regular',
    color: Theme.colors.menuText
  },
  userInfoSubtitle: {
    fontSize: '12 rem',
    lineHeight: '17 rem',
    fontFamily: 'NotoSans-Regular',
    color: '#EB7F00'
  },
  dividerContainer: {
    height: '40 rem',
    justifyContent: 'flex-end'
  },
  divider: {
    height: 3,
    opacity: 0.16,
    backgroundColor: Theme.colors.menuDivider
  },
  drawerItemContainer: {
    paddingTop: '20 rem',
    paddingBottom: '20 rem'
  },
  drawerItem: {
    flexDirection: 'row',
    paddingVertical: '18 rem'
  },
  drawerItemText: {
    fontSize: '16 rem',
    lineHeight: '22 rem',
    fontFamily: 'NotoSerif-Bold',
    color: Theme.colors.menuText,
    paddingHorizontal: '24 rem'
  }
});

/* MARK: - UI Components */

const CustomDrawerContentComponent = ({ navigation }: { navigation: any }) => {
  /* Hooks */
  const { uiState } = useStore();
  const {
    menuItems,
    navigateAndCloseDrawer,
    verifyProfileModalVisibility,
    setVerifyProfileModalVisibility,
    profileAction,
    registerNewProfile
  } = useNavigationAuthActions(navigation);

  /* Render */

  return (
    <Observer>
      {() => (
        <>
          {/* Verify profile modal */}
          <Modal animationType="slide" transparent={false} visible={verifyProfileModalVisibility}>
            <DecisionModal
              config={{
                ui: {
                  title: t('menu.modals.verifyProfile.title'),
                  message: t('menu.modals.verifyProfile.message'),
                  background: Theme.images.modalUser,
                  firstButtonTitle: t('menu.modals.verifyProfile.firstButton'),
                  secondButtonTitle: t('menu.modals.verifyProfile.secondButton')
                },
                hooks: {
                  onFirstButtonPress: () => setVerifyProfileModalVisibility(false),
                  onSecondButtonPress: registerNewProfile
                }
              }}
            />
          </Modal>

          {/* BACKGROUND */}
          <View style={{ ...layoutStyles.background }}>
            <Image
              style={{ ...layoutStyles.backgroundImage, ...Theme.palette.image }}
              source={Theme.images.menu.background}
            />
          </View>

          <View style={{ ...layoutStyles.content }}>
            {/* CONTAINER */}
            <View style={{ ...layoutStyles.container }}>
              {/* HEADER */}
              <View style={{ ...layoutStyles.header }}>
                {/* AVATAR */}
                <View>
                  <Image
                    style={{ ...layoutStyles.avatarImage }}
                    resizeMode="stretch"
                    source={Theme.images.menu.avatar}
                  />
                </View>

                {/* USER INFO */}
                <View style={{ ...layoutStyles.userInfo }}>
                  {uiState.isAuthenticated ? (
                    <>
                      <Text style={{ ...layoutStyles.userInfoHeader }}>
                        {/* // $FlowExpectedError: isAuthenticated === user != null */}
                        {uiState.user.email}
                      </Text>
                      {!uiState.user.verified ? (
                        <TouchableHighlight underlayColor="transparent" onPress={profileAction}>
                          <Text style={{ ...layoutStyles.userInfoSubtitle }}>
                            {/* // $FlowExpectedError: isAuthenticated === user != null */}
                            {t('menu.verifyProfileAction')}
                          </Text>
                        </TouchableHighlight>
                      ) : null}
                    </>
                  ) : (
                    <TouchableHighlight
                      underlayColor="transparent"
                      onPress={() => navigateAndCloseDrawer('SignIn')}
                    >
                      <>
                        <Text style={{ ...layoutStyles.userInfoHeader }}>
                          {t('menu.anonymousTitle')}
                        </Text>
                        <Text style={{ ...layoutStyles.userInfoSubtitle }}>
                          {t('menu.anonymousAction')}
                        </Text>
                      </>
                    </TouchableHighlight>
                  )}
                </View>

                {/* DISMISS */}
                <View>
                  <TouchableHighlight
                    underlayColor="transparent"
                    onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
                  >
                    <Image resizeMode="stretch" source={Theme.images.menu.close} />
                  </TouchableHighlight>
                </View>
              </View>

              {/* SEPARATOR */}
              <View style={{ ...layoutStyles.dividerContainer }}>
                <Divider style={{ ...layoutStyles.divider }} />
              </View>

              {/* NAVIGATION ITEMS */}
              <ScrollView contentContainerStyle={{ ...layoutStyles.drawerItemContainer }}>
                {menuItems.map((menuItem, index) => (
                  <DrawerItem
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    icon={menuItem.icon}
                    label={menuItem.label}
                    onPress={menuItem.onPress}
                  />
                ))}
              </ScrollView>
            </View>
          </View>
        </>
      )}
    </Observer>
  );
};

const DrawerItem = ({ icon, label, onPress }: { icon: any, label: string, onPress: Function }) => (
  <TouchableHighlight underlayColor="transparent" onPress={onPress}>
    <View style={{ ...layoutStyles.drawerItem }}>
      <Image source={icon} style={{ ...Theme.palette.image }} />
      <Text style={{ ...layoutStyles.drawerItemText }}>{label}</Text>
    </View>
  </TouchableHighlight>
);

/* MARK: - Navigation Drawer */

export default createDrawerNavigator(
  {
    Teachings,
    Bible,
    Library,
    Groups,
    Settings,
    AuthStack: {
      screen: AuthStack,
      path: ''
    },
    Onboarding,
    P2PSharing,
    Language: SelectLanguage
  },
  {
    drawerPosition: I18nManager.isRTL() ? 'right' : 'left',
    drawerType: 'slide',
    drawerWidth: '100%',
    hideStatusBar: true,
    contentComponent: CustomDrawerContentComponent
  }
);
