/**
 * @flow
 */

import React from 'react';
import { View, Text, Linking, Modal } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import EStyleSheet from 'react-native-extended-stylesheet';

import { KeyboardHidden } from 'TTB/src/lib/utils';
import { Input, Button, LinkButton, CheckBox } from 'TTB/src/theme/Components';
import Theme from 'TTB/src/theme/Theme';
import { DecisionModal } from 'TTB/src/theme/Components.modal';
import I18nManager, { t } from 'TTB/src/services/i18n';
import Constants from 'TTB/src/constants';

import { SocialContainer } from 'TTB/src/views/auth/Components';

import { useEmailSignUp } from './SignUp.hooks';
import { useFacebookSignin } from './Facebook.hooks';
import { useGoogleSignin } from './Google.hooks';

/* MARK: - Layout Styles */

const layoutStyles = EStyleSheet.create({
  topSpace: {
    flex: 15,
    '@media (max-height: 600)': {
      flex: 10
    }
  },
  formContainer: {
    flex: 75,
    '@media (max-height: 600)': {
      flex: 80
    }
  },
  headerContainer: {
    flex: 15,
    justifyContent: 'center'
  },
  fieldsContainer: {
    justifyContent: 'space-around',
    flex: 30
  },
  accountPrivateContainer: {
    justifyContent: 'center',
    flex: 20
  },
  signUpButtonContainer: {
    justifyContent: 'center',
    flex: 15
  },
  socialLoginContainer: {
    paddingTop: 15,
    justifyContent: 'center',
    flex: 15
  },
  footerContainer: {
    flex: 10
  }
});

/* MARK: - UI Components */

export default () => {
  /* Hooks */

  const { navigate } = useNavigation();
  const { fields, modals, actions, submit } = useEmailSignUp();
  const { submit: facebookSubmit } = useFacebookSignin();
  const { submit: googleSubmit } = useGoogleSignin();

  /* Helper functions */

  function onPressTerms() {
    const lang = I18nManager.currentLanguageCode();
    Linking.openURL(Constants.TERMS_URL + lang);
  }

  /* Render */

  return (
    <View style={{ ...Theme.palette.verticalContainer }}>
      {/* Success modal */}
      <Modal animationType="slide" transparent={false} visible={modals.successModalVisibility}>
        <DecisionModal
          config={{
            ui: {
              title: t('signUp.modals.success.title'),
              message: t('signUp.modals.success.message'),
              background: Theme.images.modalUser,
              firstButtonTitle: t('signUp.modals.success.firstButton')
            },
            hooks: {
              onFirstButtonPress: () => navigate('SignIn')
            }
          }}
        />
      </Modal>

      {/* Email exists modal */}
      <Modal animationType="slide" transparent={false} visible={modals.uniqueEmailModalVisibility}>
        <DecisionModal
          config={{
            ui: {
              title: t('signUp.modals.emailExists.title'),
              message: t('signUp.modals.emailExists.message'),
              background: Theme.images.modalUser,
              firstButtonTitle: t('signUp.modals.emailExists.firstButton'),
              secondButtonTitle: t('signUp.modals.emailExists.secondButton')
            },
            hooks: {
              onFirstButtonPress: () => navigate('SignIn'),
              onSecondButtonPress: () => modals.setUniqueEmailModalVisibility(false)
            }
          }}
        />
      </Modal>

      {/* Make private modal */}
      <Modal animationType="slide" transparent={false} visible={modals.privateModalVisibility}>
        <DecisionModal
          config={{
            ui: {
              title: t('signUp.modals.privateAccount.title'),
              message: t('signUp.modals.privateAccount.message'),
              background: Theme.images.modalLock,
              firstButtonTitle: t('signUp.modals.privateAccount.firstButton'),
              secondButtonTitle: t('signUp.modals.privateAccount.secondButton')
            },
            hooks: {
              onFirstButtonPress: () => {
                fields.setIsPrivate(true);
                modals.setPrivateModalVisibility(false);
              },
              onSecondButtonPress: () => modals.setPrivateModalVisibility(false)
            }
          }}
        />
      </Modal>

      <View style={{ ...layoutStyles.topSpace }} />

      <View style={{ ...layoutStyles.formContainer }}>
        {/* Header */}
        <View style={{ ...layoutStyles.headerContainer }}>
          <Text style={{ ...Theme.palette.header }}>{t('signUp.header')}</Text>
        </View>

        {/* Fields */}
        <View style={{ ...layoutStyles.fieldsContainer }}>
          <Input
            placeholder={t('signUp.emailPlaceholder')}
            icon="email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={fields.email}
            onChangeText={val => fields.setEmail(val)}
          />
          <Input
            placeholder={t('signUp.passwordPlaceholder')}
            secureTextEntry
            autoCapitalize="none"
            value={fields.password}
            onChangeText={val => fields.setPassword(val)}
          />
        </View>

        {/* Make Account private */}
        <View style={{ ...layoutStyles.accountPrivateContainer }}>
          <CheckBox
            title={t('signUp.privateAction')}
            checked={fields.isPrivate}
            onPress={actions.togglePrivacy}
          />

          <Text style={{ ...Theme.palette.h7 }} onPress={onPressTerms}>
            <Text>{t('signUp.termsDisclaimer.pre')}</Text>
            <Text style={{ color: Theme.colors.supportAction }}>
              {t('signUp.termsDisclaimer.terms')}
            </Text>
            <Text>{t('signUp.termsDisclaimer.post')}</Text>
          </Text>
        </View>

        <KeyboardHidden>
          {/* Sign Up Button */}
          <View style={{ ...layoutStyles.signUpButtonContainer }}>
            <Button
              title={
                submit.sending || facebookSubmit.sending || googleSubmit.sending
                  ? t('uiControls.button.sending')
                  : t('signUp.callToAction')
              }
              onPress={submit.doSend}
              disabled={!submit.inputIsValid()}
            />
          </View>

          <View style={{ ...layoutStyles.socialLoginContainer }}>
            <SocialContainer
              header={t('signUp.signUpAlternatives')}
              onFacebookPress={facebookSubmit.doSend}
              onGooglePress={googleSubmit.doSend}
            />
          </View>
        </KeyboardHidden>
      </View>

      <KeyboardHidden>
        {/* 'Have an account?' */}
        <View style={{ ...layoutStyles.footerContainer }}>
          <LinkButton
            dark
            title={t('signUp.haveAnAccountAction')}
            onPress={() => navigate('SignIn')}
          />
        </View>
      </KeyboardHidden>
    </View>
  );
};
