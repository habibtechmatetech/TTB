/**
 * @flow
 */

import { useState } from 'react';
import { Linking } from 'react-native';
import { useStore } from 'TTB/src/model/root';
import { t } from 'TTB/src/services/i18n';
import Theme from 'TTB/src/theme/Theme';
import Constants from 'TTB/src/constants';
import { settingsState } from '../../model/settings-state';

/* MARK: - Type Definitions */

export type MenuItem = {|
  icon: any, // ImageSourcePropType
  label: string,
  onPress: () => void
|};

export type NavigationAuthHook = {|
  menuItems: Array<MenuItem>,
  navigateAndCloseDrawer: string => void,
  verifyProfileModalVisibility: boolean,
  setVerifyProfileModalVisibility: boolean => void,
  signOut: () => void,
  profileAction: () => void,
  registerNewProfile: () => void
|};

/* MARK: - Hook */

// $FlowExpectedError: useNavigation hooks uses typescript types
export function useNavigationAuthActions(navigation): NavigationAuthHook {
  /* Hooks */

  const { uiState, favoritesState, playlistsState } = useStore();
  const [verifyProfileModalVisibility, setVerifyProfileModalVisibility] = useState<boolean>(false);

  /* Properties */

  const menuItems = [
    {
      icon: Theme.images.menu.bible,
      label: t('menu.bibleSection'),
      onPress: () => navigateAndCloseDrawer('Bible')
    },
    {
      icon: Theme.images.menu.teachings,
      label: t('menu.teachingsSection'),
      onPress: () => navigateAndCloseDrawer('Teachings')
    },
    {
      icon: Theme.images.menu.library,
      label: t('menu.librarySection'),
      onPress: () => navigateAndCloseDrawer('Library')
    }
  ];

  // Add the Groups option if the user is authenticated...
  if (uiState.isAuthenticated) {
    menuItems.push({
      icon: Theme.images.menu.groups,
      label: t('menu.groupsSection'),
      onPress: () => navigateAndCloseDrawer('Groups')
    });
  }

  menuItems.push({
    icon: Theme.images.menu.donate,
    label: t('menu.donateSection'),
    onPress: () => {
      const url = Constants.DONATIONS_URL;
      Linking.canOpenURL(url).then(supported => {
        if (supported) {
          Linking.openURL(url);
        }
      });
    }
  });

  menuItems.push({
    icon: Theme.images.menu.settings,
    label: t('menu.settingsSection'),
    onPress: () => navigateAndCloseDrawer('Settings')
  });

  /* Helper functions */

  function navigateAndCloseDrawer(route: string) {
    navigation.navigate(route);
    navigation.closeDrawer();
  }

  /* Functions */

  function signOut() {
    uiState.signOut();
    favoritesState.signOut();
    playlistsState.signOut();
    settingsState.signOut();
    navigation.closeDrawer();
  }

  function profileAction() {
    if (uiState.isAuthenticated) {
      // $FlowExpectedError: isAuthenticated === user != null
      if (uiState.user.verified) {
        navigateAndCloseDrawer('Profile');
      } else {
        setVerifyProfileModalVisibility(true);
      }
    }
  }

  function registerNewProfile() {
    signOut();
    navigation.navigate('SignUp');
    setVerifyProfileModalVisibility(false);
  }

  /* Public API */
  return {
    menuItems,
    navigateAndCloseDrawer,
    verifyProfileModalVisibility,
    setVerifyProfileModalVisibility,
    signOut,
    profileAction,
    registerNewProfile
  };
}
