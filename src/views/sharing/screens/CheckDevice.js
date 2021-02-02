/**
 * @flow
 */
import React from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { t } from 'TTB/src/services/i18n';
import Theme from '../../../theme/Theme';

export default () => {
  const navigation = useNavigation();
  const networkType: string = useNavigationParam('networkType');

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
            <Text style={Theme.palette.h8}>{t('checkDevice.check')}</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.popToTop();
                navigation.goBack();
              }}
            >
              <Image source={Theme.images.closeX} />
            </TouchableOpacity>
          </View>
          <Image
            source={Theme.images.share.checkDevice}
            style={{ alignSelf: 'center', marginTop: 36 }}
          />
          <View
            style={{
              marginTop: 26,
              marginHorizontal: 50,
              alignItems: 'center'
            }}
          >
            <Text style={Theme.palette.h2}>{t('checkDevice.check')}</Text>
          </View>
          <View
            style={{
              marginTop: 13,
              marginBottom: 39,
              marginHorizontal: 50,
              alignItems: 'center'
            }}
          >
            <Text style={{ ...Theme.palette.h8, textAlign: 'center' }}>
              {t('checkDevice.makeSure')}
            </Text>
          </View>
          <TouchableOpacity
            style={{
              height: 50,
              width: '80%',
              justifyContent: 'center',
              alignItems: 'center',
              borderRadius: 15,
              backgroundColor: Theme.colors.button,
              marginLeft: 50,
              marginRight: 50,
              flexDirection: 'row',
              alignSelf: 'center'
            }}
            onPress={() => {
              if (networkType === 'wifi') {
                navigation.navigate('ConnectToDevice');
              }
            }}
          >
            <Text style={Theme.palette.closeText}>{t('checkDevice.continue')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};
