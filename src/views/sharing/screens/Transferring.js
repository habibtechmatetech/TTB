/**
 * @flow
 */
import React, { useEffect, useContext } from 'react';
import { Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import { t } from 'TTB/src/services/i18n';
import Theme from '../../../theme/Theme';
import { Context } from '../Wifip2p';

export default () => {
  const navigation = useNavigation();
  const { sendFile, transferring, disconnect } = useContext(Context);

  useEffect(() => {
    sendFile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: Theme.colors.background,
        flexDirection: 'column',
        alignItems: 'stretch'
      }}
    >
      <View
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center'
        }}
      >
        <View
          style={{
            marginBottom: 55,
            backgroundColor: 'white',
            width: 100,
            borderRadius: 50,
            height: 100,
            justifyContent: 'center',
            alignItems: 'center',
            display: transferring ? 'flex' : 'none'
          }}
        >
          {transferring && transferring.status === 'transferring' && (
            <Image source={Theme.images.transferring} />
          )}
          {transferring && transferring.status === 'done' && (
            <Image source={Theme.images.downloadComplete} />
          )}
          {transferring && transferring.status === 'failed' && (
            <Image source={Theme.images.downloadFailed} />
          )}
        </View>
        <Text style={{ ...Theme.palette.h2 }}>
          {/* eslint-disable-next-line no-nested-ternary */}
          {transferring && transferring.status === 'transferring'
            ? 'Transferring'
            : // eslint-disable-next-line no-nested-ternary
            transferring && transferring.status === 'done'
            ? 'Transfer Complete'
            : transferring && transferring.status === 'failed'
            ? 'Transfer Failed'
            : 'Starting Transfer'}
        </Text>
      </View>
      <View>
        {transferring && (transferring.status === 'failed' || transferring.status === 'complete') && (
          <>
            <TouchableOpacity
              onPress={() => {
                sendFile();
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
                marginBottom: 34,
                marginTop: 60,
                flexDirection: 'row',
                alignSelf: 'center'
              }}
            >
              <Text style={Theme.palette.closeText}>{t('transferring.tryAgain')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                disconnect();
                navigation.popToTop();
                navigation.goBack();
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
                marginBottom: 34,
                flexDirection: 'row',
                alignSelf: 'center'
              }}
            >
              <Text style={Theme.palette.closeText}>{t('transferring.close')}</Text>
            </TouchableOpacity>
          </>
        )}
        {transferring && transferring.status === 'done' && (
          <TouchableOpacity
            onPress={() => {
              navigation.popToTop();
              navigation.goBack();
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
              marginBottom: 34,
              flexDirection: 'row',
              alignSelf: 'center'
            }}
          >
            <Text style={Theme.palette.closeText}>{t('transferring.close')}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};
