/**
 * @flow
 */
import React from 'react';
import { Modal, View, Text, Image, TouchableOpacity } from 'react-native';
import Teaching from 'TTB/src/views/main/screens/Teaching';
import { DecisionModal } from 'TTB/src/theme/Components.modal';
import Theme from 'TTB/src/theme/Theme';
import { t } from 'TTB/src/services/i18n';
import { LinkButton } from 'TTB/src/theme/Components';
import { useNavigation } from 'react-navigation-hooks';
import { useOnboarding, useFirstTimeTeaching, useTutorial, useRegister } from './Onboarding.hooks';
import type { OnboardingType } from './Onboarding.hooks';
import colors from '../../../theme/colors';
import { TutorialOnboarding } from './TutorialOnboarding';

/* MARK: - UI Components */

const styles = {
  title: {
    fontFamily: 'Noto Serif',
    fontWeight: '600',
    fontSize: 28,
    lineHeight: 38,
    letterSpacing: 0.116667,
    color: '#161B25'
  },
  subTitle: {
    fontFamily: 'Noto Sans',
    fontSize: 14,
    lineHeight: 19,
    letterSpacing: 0.1,
    color: '#424F78',
    marginTop: 20,
    marginBottom: 10
  },
  skipButton: {
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'right',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: 3
  },
  tutorialPicture: {
    alignSelf: 'center',
    margin: 20
  },
  featureTitle: {
    fontFamily: 'Noto Sans',
    fontWeight: 'bold',
    fontSize: 15,
    lineHeight: 21
  },
  featureSubtitle: {
    fontFamily: 'Noto Sans',
    fontSize: 15,
    lineHeight: 20
  },
  createAccountButton: {
    marginTop: 40,
    alignSelf: 'center',
    flex: 1
  },
  footerContainer: {
    flex: 1,
    alignSelf: 'center'
  },
  container: {
    alignItems: 'flex-end'
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
};

export default ({ children }: { children: React.Node }) => {
  /* Hooks */
  const onboarding = useOnboarding(_onboardingListener);
  const {
    modalShown: firstTimeModalShown,
    teaching,
    startOnboarding: startFirstTimeOnboarding,
    finishOnboarding: finishFirstTimeOnboarding,
    secondaryModal: firstTimeSecondaryModal,
    deactivateFirstTime
  } = useFirstTimeTeaching(onboarding);

  const { showTutorial, startTutorialOnboarding, finishTutorialOnboarding } = useTutorial(
    onboarding
  );

  const { showRegisterModal, startRegisterOnboarding, finishRegisterOnboarding } = useRegister(
    onboarding
  );

  const navigation = useNavigation();

  /* Helper functions */
  function _onboardingListener(type: OnboardingType) {
    switch (type) {
      case 'FirstAudio':
        startFirstTimeOnboarding();
        break;
      case 'Tutorial':
        deactivateFirstTime();
        startTutorialOnboarding();
        break;
      case 'Registration':
        deactivateFirstTime();
        startRegisterOnboarding();
        break;
      default:
        break;
    }
  }

  /* Render */
  return (
    <>
      {teaching == null ? (
        <></>
      ) : (
        <Modal animationType="slide" transparent={false} visible={firstTimeModalShown}>
          <Teaching teachings={[teaching]} dismiss={finishFirstTimeOnboarding} />

          <Modal
            animationType="slide"
            transparent={false}
            visible={firstTimeModalShown && firstTimeSecondaryModal.isVisible}
          >
            <DecisionModal
              config={{
                ui: {
                  background: Theme.images.modalInitialAudio,
                  firstButtonTitle: t('teaching.modals.firstTime.firstButton'),
                  secondButtonTitle: t('teaching.modals.firstTime.secondButton')
                },
                hooks: {
                  onFirstButtonPress: firstTimeSecondaryModal.continueListeningOption,
                  onSecondButtonPress: firstTimeSecondaryModal.startYourJourneyOption
                }
              }}
            />
          </Modal>
        </Modal>
      )}

      <>{children}</>
      <TutorialOnboarding show={showTutorial} close={finishTutorialOnboarding} />
      <Modal animationType="slide" transparent={false} visible={showRegisterModal}>
        <View
          style={{
            flex: 1,
            backgroundColor: colors.background,
            flexDirection: 'column'
          }}
        >
          <View style={styles.container}>
            <TouchableOpacity
              onPress={() => {
                finishRegisterOnboarding();
              }}
            >
              <View
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexDirection: 'row',
                  margin: 50
                }}
              >
                <Text style={styles.skipButton}>{t('onboarding.registerPage.noThanks')}</Text>
                <Image source={Theme.images.tutorials.skipArrow} style={{ paddingLeft: 3 }} />
              </View>
            </TouchableOpacity>
          </View>
          <View
            style={{
              flex: 1,
              flexDirection: 'column-reverse',
              marginLeft: 30,
              marginRight: 30
            }}
          >
            <View style={styles.footerContainer}>
              <LinkButton
                dark
                title={t('onboarding.registerPage.haveAccount')}
                onPress={() => {
                  finishRegisterOnboarding();
                  navigation.navigate('SignIn');
                }}
              />
            </View>
            <TouchableOpacity
              onPress={() => {
                finishRegisterOnboarding();
                navigation.navigate('SignUp');
              }}
            >
              <View
                style={{
                  marginTop: 24,
                  height: 50,
                  borderRadius: 12,
                  backgroundColor: '#006FA1',
                  flexDirection: 'row',
                  // alignSelf: 'center',
                  alignItems: 'center',
                  width: '100%',
                  justifyContent: 'space-around'
                }}
              >
                <Text
                  style={{
                    fontFamily: 'Noto Sans',
                    fontStyle: 'normal',
                    fontWeight: '600',
                    fontSize: 13,
                    lineHeight: 18,
                    color: '#FFFFFF'
                  }}
                >
                  {t('onboarding.registerPage.createAccount')}
                </Text>
              </View>
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', marginTop: 30, marginEnd: 60 }}>
              <Image source={Theme.images.tutorials.discussOthers} />
              <View style={{ flexDirection: 'column', paddingLeft: 20 }}>
                <Text style={styles.featureTitle}>{t('onboarding.registerPage.title1')}</Text>
                <Text style={styles.featureSubtitle}>{t('onboarding.registerPage.subtitle1')}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 30, marginEnd: 60 }}>
              <Image source={Theme.images.tutorials.shareSync} />
              <View style={{ flexDirection: 'column', paddingLeft: 20 }}>
                <Text style={styles.featureTitle}>{t('onboarding.registerPage.title2')}</Text>
                <Text style={styles.featureSubtitle}>{t('onboarding.registerPage.subtitle2')}</Text>
              </View>
            </View>
            <View style={{ flexDirection: 'row', marginTop: 30, marginEnd: 60 }}>
              <Image source={Theme.images.tutorials.seeFavs} />
              <View style={{ flexDirection: 'column', paddingLeft: 20 }}>
                <Text style={styles.featureTitle}>{t('onboarding.registerPage.title3')}</Text>
                <Text style={styles.featureSubtitle}>{t('onboarding.registerPage.subtitle3')}</Text>
              </View>
            </View>
            <Text style={styles.subTitle}>{t('onboarding.registerPage.subtitle4')}</Text>
            <Text style={styles.title}>{t('onboarding.registerPage.title4')}</Text>
          </View>
        </View>
      </Modal>
    </>
  );
};
