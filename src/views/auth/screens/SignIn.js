/**
 * @flow
 */

import React from 'react';
import { View, Text } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';

import { KeyboardHidden } from 'TTB/src/lib/utils';
import { Input, Button, LinkButton } from 'TTB/src/theme/Components';
import Theme from 'TTB/src/theme/Theme';
import { t } from 'TTB/src/services/i18n';
import { SocialContainer } from 'TTB/src/views/auth/Components';

import { useEmailSignIn } from './SignIn.hooks';
import { useFacebookSignin } from './Facebook.hooks';
import { useGoogleSignin } from './Google.hooks';

/* MARK: - Layout Styles */

const layoutStyles = {
  topSpace: {
    flex: 2
  },
  formContainer: {
    flex: 7,
    justifyContent: 'flex-end'
  },
  headerContainer: {
    flex: 15,
    justifyContent: 'flex-start'
  },
  fieldsContainer: {
    justifyContent: 'space-around',
    flex: 30
  },
  forgotPasswordContainer: {
    justifyContent: 'center',
    flex: 10
  },
  signInButtonContainer: {
    justifyContent: 'center',
    flex: 25
  },
  socialLoginContainer: {
    justifyContent: 'flex-end',
    flex: 20
  },
  footerContainer: {
    flex: 1,
    justifyContent: 'flex-start'
  }
};

/* MARK: - UI Components */

export default () => {
  /* Hooks */

  const { navigate } = useNavigation();
  const { fields, submit } = useEmailSignIn();
  const { submit: facebookSubmit } = useFacebookSignin();
  const { submit: googleSubmit } = useGoogleSignin();

  /* Render */
  return (
    <View style={{ ...Theme.palette.verticalContainer }}>
      <View style={{ ...layoutStyles.topSpace }} />

      <View style={{ ...layoutStyles.formContainer }}>
        {/* Header */}
        <View style={{ ...layoutStyles.headerContainer }}>
          <Text style={{ ...Theme.palette.header }}>{t('signIn.header')}</Text>
        </View>

        {/* Fields */}
        <View style={{ ...layoutStyles.fieldsContainer }}>
          <Input
            placeholder={t('signIn.emailPlaceholder')}
            icon="email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={fields.email}
            onChangeText={val => {
              fields.setEmail(val);
            }}
          />

          <Input
            placeholder={t('signIn.passwordPlaceholder')}
            secureTextEntry
            autoCapitalize="none"
            value={fields.password}
            onChangeText={val => {
              fields.setPassword(val);
            }}
            onSubmitEditing={submit.doSend}
          />
        </View>

        {/* Forgot password */}
        <View style={{ ...layoutStyles.forgotPasswordContainer }}>
          <LinkButton title={t('signIn.forgotAction')} onPress={() => navigate('ForgotPassword')} />
        </View>

        {/* Sign In Button */}
        <View style={{ ...layoutStyles.signInButtonContainer }}>
          <Button
            title={
              submit.sending || facebookSubmit.sending || googleSubmit.sending
                ? t('uiControls.button.sending')
                : t('signIn.callToAction')
            }
            onPress={submit.doSend}
            disabled={!submit.inputIsValid()}
          />
        </View>

        <KeyboardHidden>
          <View style={{ ...layoutStyles.socialLoginContainer }}>
            <SocialContainer
              header={t('signIn.signInAlternatives')}
              onFacebookPress={facebookSubmit.doSend}
              onGooglePress={googleSubmit.doSend}
            />
          </View>
        </KeyboardHidden>
      </View>

      <KeyboardHidden>
        {/* 'No account?' Create one */}
        <View style={{ ...layoutStyles.footerContainer }}>
          <LinkButton dark title={t('signIn.noAccountAction')} onPress={() => navigate('SignUp')} />
        </View>
      </KeyboardHidden>
    </View>
  );
};
