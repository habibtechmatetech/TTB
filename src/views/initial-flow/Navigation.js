/**
 * @flow
 */

import * as React from 'react';
import { useEffect } from 'react';
import { useNavigation } from 'react-navigation-hooks';
import { createSwitchNavigator } from 'react-navigation';
import DrawerNavigator from 'TTB/src/views/main/Navigation.drawer';
import Onboarding from 'TTB/src/views/initial-flow/screens/Onboarding';
import { observer } from 'mobx-react';
import { Modal, Text, TouchableOpacity, View } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { t } from 'TTB/src/services/i18n';
import { useStore } from '../../model/root';

const styles = EStyleSheet.create({
  devotionModalBackgroundView: {
    height: '100%',
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(0, 17, 29, 0.6)'
  },
  devotionModalView: {
    height: '50%',
    width: '80%',
    borderRadius: 12,
    backgroundColor: 'white'
  },
  devotionModalTitle: {
    marginTop: '35%',
    fontFamily: 'Noto Serif',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 18,
    lineHeight: 25,
    textAlign: 'center',
    color: '#161B25'
  },
  devotionModalContent: {
    marginTop: '5%',
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
    letterSpacing: 0.1,
    color: '#424F78'
  },
  devotionModalJoinButton: {
    marginTop: '10%',
    marginLeft: '20%',
    marginRight: '20%',
    borderRadius: 25,
    backgroundColor: '#006FA1'
  },
  devotionModalJoinButtonText: {
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
    color: 'white'
  },
  devotionModalCloseButton: {
    marginTop: '7%',
    marginLeft: '20%',
    marginRight: '20%',
    borderWidth: 2,
    borderStyle: 'solid',
    borderColor: '#006FA1',
    borderRadius: 25
  },
  devotionModalCloseButtonText: {
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
  }
});

/* MARK: - Onboarding */

const OnboardingAwareDrawerNavigator = () => {
  return (
    <Onboarding>
      <DrawerNavigator navigation={useNavigation()} />
      <DevotionModal />
    </Onboarding>
  );
};
OnboardingAwareDrawerNavigator.router = DrawerNavigator.router;

/* MARK: - Select Language */

const LanguageBootstrap = () => {
  /* Hooks */
  const { navigate } = useNavigation();

  /* Effects */
  useEffect(_init, []);

  /* Helper functions */
  function _init() {
    const route = 'Onboarding';
    navigate(route);
  }

  /* Render */
  return <></>;
};

const LanguageSwitch = createSwitchNavigator({
  Bootstrap: LanguageBootstrap,
  Onboarding: {
    screen: OnboardingAwareDrawerNavigator,
    path: ''
  }
});

const DevotionModal = observer(() => {
  const { groupsState } = useStore();
  const navigation = useNavigation();

  return groupsState.showDevotionModal ? (
    <Modal transparent visible>
      <View
        style={{
          ...styles.devotionModalBackgroundView
        }}
      >
        <View
          style={{
            ...styles.devotionModalView
          }}
        >
          <Text
            style={{
              ...styles.devotionModalTitle
            }}
          >
            A Devotion Has Started
          </Text>
          <Text
            style={{
              ...styles.devotionModalContent
            }}
          >
            {`${groupsState.group ? groupsState.group.name : ''} ${t(
              'startDevotion.devotionStartedLabel'
            )}`}
          </Text>
          <TouchableOpacity
            onPress={() => {
              groupsState.showDevotionModal = false;
              navigation.navigate('Chat', { group: groupsState.group });
            }}
          >
            <View
              style={{
                ...styles.devotionModalJoinButton
              }}
            >
              <Text
                style={{
                  ...styles.devotionModalJoinButtonText
                }}
              >
                Join
              </Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => {
              groupsState.showDevotionModal = false;
            }}
          >
            <View
              style={{
                ...styles.devotionModalCloseButton
              }}
            >
              <Text
                style={{
                  ...styles.devotionModalCloseButtonText
                }}
              >
                Close
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  ) : (
    <></>
  );
});

export default LanguageSwitch;
