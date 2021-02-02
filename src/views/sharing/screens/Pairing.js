/**
 * @flow
 */
import React, { useContext, useEffect } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { t } from 'TTB/src/services/i18n';
import Theme from '../../../theme/Theme';
import { Context } from '../Wifip2p';
import type { Device } from '../../../lib/types';

export default () => {
  const navigation = useNavigation();
  const device: Device = useNavigationParam('device');
  const { connect, connecting, connected } = useContext(Context);

  useEffect(() => {
    connect(device);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [device]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Theme.colors.modal.background,
        flexDirection: 'column-reverse',
        alignItems: 'center'
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
            <Text style={Theme.palette.h8}>{t('pairing.connect')}</Text>
            <TouchableOpacity
              onPress={() => {
                navigation.pop();
              }}
            >
              <Image source={Theme.images.closeX} />
            </TouchableOpacity>
          </View>

          <View
            style={{
              marginTop: 40,
              marginBottom: 20,
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <Image source={Theme.images.share.iPhone} />
            {!connecting && (
              <Image
                style={{
                  position: 'absolute',
                  top: '-15%',
                  left: '55%'
                }}
                source={connected ? Theme.images.share.pairSuccess : Theme.images.share.pairFailed}
              />
            )}
          </View>

          <Text style={{ ...Theme.palette.h2, alignSelf: 'center' }}>
            {/* eslint-disable-next-line no-nested-ternary */}
            {connecting
              ? t('pairing.pairing')
              : connected
              ? t('pairing.success')
              : t('pairing.failed')}
          </Text>

          <Text
            style={{
              ...Theme.palette.h8,
              textAlign: 'center',
              marginTop: 15,
              marginHorizontal: 30,
              marginBottom: 50
            }}
          >
            {t('pairing.makeSure')}
          </Text>

          {!connecting && (
            <TouchableOpacity
              onPress={() => {
                if (connected) {
                  navigation.navigate('Transferring');
                } else {
                  navigation.goBack();
                }
              }}
              style={{
                height: 50,
                width: '80%',
                justifyContent: 'center',
                alignItems: 'center',
                borderRadius: 12,
                backgroundColor: Theme.colors.button,
                marginLeft: 32,
                marginRight: 32,
                marginBottom: 0,
                flexDirection: 'row',
                alignSelf: 'center'
              }}
            >
              <Text style={Theme.palette.closeText}>
                {connected ? t('pairing.continue') : t('pairing.tryAgain')}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};
