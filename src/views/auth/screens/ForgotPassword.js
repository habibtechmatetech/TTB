/**
 * @flow
 */

import React from 'react';
import { View, Text, Image } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';

import { KeyboardHidden } from 'TTB/src/lib/utils';
import { Input, Button } from 'TTB/src/theme/Components';
import { t } from 'TTB/src/services/i18n';
import Theme from 'TTB/src/theme/Theme';

import { useForgotPassword } from './ForgotPassword.hooks';

/* MARK: - Layout Styles */

const layoutStyles = EStyleSheet.create({
  formContainer: {
    flex: 1,
    justifyContent: 'center'
  },
  headerContainer: {
    marginTop: '0 rem'
  },
  fieldsContainer: {
    marginTop: '60 rem',
    marginBottom: '60 rem'
  },
  buttonContainer: {}
});

/* MARK: - UI Components */

export default () => {
  /* Hooks */
  const { fields, submit } = useForgotPassword();

  /* Render */
  return (
    <View style={{ ...Theme.palette.verticalContainer }}>
      <KeyboardHidden>
        <Image style={{ ...Theme.palette.bottomLeftOval }} source={Theme.images.cornerOval} />
      </KeyboardHidden>

      <View style={{ ...layoutStyles.formContainer }}>
        {/* Header */}
        <View style={{ ...layoutStyles.headerContainer }}>
          <KeyboardHidden>
            <Text style={{ ...Theme.palette.header }}>{t('forgotPassword.header')}</Text>
          </KeyboardHidden>
        </View>

        {/* Fields */}
        <View style={{ ...layoutStyles.fieldsContainer }}>
          <Input
            placeholder={t('forgotPassword.emailPlaceholder')}
            icon="email"
            keyboardType="email-address"
            autoCapitalize="none"
            value={fields.email}
            onChangeText={val => {
              fields.setEmail(val);
            }}
            onSubmitEditing={submit.doSend}
          />

          <Text style={{ ...Theme.palette.h6, paddingTop: 10, paddingHorizontal: 3 }}>
            {t('forgotPassword.message')}
          </Text>
        </View>

        {/* Reset Password Button */}
        <View style={{ ...layoutStyles.buttonContainer }}>
          <Button
            title={
              submit.sending ? t('uiControls.button.sending') : t('forgotPassword.callToAction')
            }
            onPress={submit.doSend}
            disabled={!submit.inputIsValid()}
          />
        </View>
      </View>
    </View>
  );
};
