/**
 * @flow
 */
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import { t } from 'TTB/src/services/i18n';
import Theme from '../../../theme/Theme';

export default () => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Theme.colors.modal.background,
        flexDirection: 'column-reverse'
      }}
    >
      <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            display: 'flex',
            width: '100%',
            alignSelf: 'flex-end',
            backgroundColor: Theme.colors.player.background,
            borderRadius: 30,
            paddingBottom: 40
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginHorizontal: 30,
              marginVertical: 13,
              alignItems: 'center'
            }}
          >
            <Text style={Theme.palette.h8}>{t('selectNetworkType.connect')}</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.goBack();
              }}
            >
              <Image source={Theme.images.closeX} />
            </TouchableOpacity>
          </View>
          <Image
            source={Theme.images.share.selectNetwork}
            style={{ alignSelf: 'center', marginTop: 24 }}
          />
          <View
            style={{
              marginTop: 26,
              alignItems: 'center'
            }}
          >
            <Text style={Theme.palette.h2}>{t('selectNetworkType.share')}</Text>
          </View>
          <View
            style={{
              marginTop: 13,
              marginBottom: 39,
              alignItems: 'center'
            }}
          >
            <Text style={Theme.palette.h6}>{t('selectNetworkType.send')}</Text>
          </View>
          <TouchableOpacity
            style={{
              height: 50,
              width: '50%',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 25,
              backgroundColor: Theme.colors.button,
              marginLeft: 32,
              marginRight: 32,
              marginTop: 24,
              flexDirection: 'row',
              alignSelf: 'center'
            }}
            onPress={() => {
              navigation.navigate('CheckDevice', { networkType: 'wifi' });
            }}
          >
            <Text style={Theme.palette.closeText}>{t('selectNetworkType.continue')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
