/**
 * @flow
 */

import React from 'react';
import { View, Text, Image } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import EStyleSheet from 'react-native-extended-stylesheet';

import { t } from 'TTB/src/services/i18n';
import Theme from 'TTB/src/theme/Theme';
import { Button } from 'TTB/src/theme/Components';

/* MARK: - Layout Styles */

const layoutStyles = EStyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: '100 rem'
  },
  image: {
    width: '158rem',
    height: '158rem'
  },
  header: {},
  message: {
    marginTop: '20 rem',
    marginBottom: '58 rem'
  },
  button: {
    alignSelf: 'stretch'
  }
});

/* MARK: - UI Components */

export default () => {
  /* Hooks */

  const { navigate } = useNavigation();

  /* Render */
  return (
    <View style={{ ...Theme.palette.verticalContainer, ...layoutStyles.container }}>
      <Image style={{ ...Theme.palette.bottomLeftShape }} source={Theme.images.bottomOval} />

      <View>
        <Image style={{ ...layoutStyles.image }} source={Theme.images.mailCircle} />
      </View>

      <View style={{ ...layoutStyles.header }}>
        <Text style={{ ...Theme.palette.header }}>{t('finishAuthSetup.header')}</Text>
      </View>

      <View style={{ ...layoutStyles.message }}>
        <Text style={{ ...Theme.palette.h6, textAlign: 'center' }}>
          {t('finishAuthSetup.message')}
        </Text>
      </View>

      <View style={{ ...layoutStyles.button }}>
        <Button title={t('finishAuthSetup.callToAction')} onPress={() => navigate('Bible')} />
      </View>
    </View>
  );
};
