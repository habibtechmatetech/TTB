/**
 * @flow
 */
import React, { useContext, useEffect } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import { t } from 'TTB/src/services/i18n';
import Theme from '../../../theme/Theme';
import { Context } from '../Wifip2p';

export default () => {
  const navigation = useNavigation();
  const { devices, connected, discoverPeers } = useContext(Context);

  useEffect(() => {
    discoverPeers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <View
      style={{
        flex: 1,
        height: '100%',
        backgroundColor: Theme.colors.modal.background,
        flexDirection: 'column-reverse'
      }}
    >
      <View style={{ flexDirection: 'row', alignSelf: 'center', height: '100%' }}>
        <View
          style={{
            flexDirection: 'column',
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            display: 'flex',
            width: '100%',
            height: '90%',
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
            <Text style={Theme.palette.h8}>{t('connectToDevice.connect')}</Text>
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Image source={Theme.images.closeX} />
            </TouchableOpacity>
          </View>
          <ScrollView>
            <Image
              source={Theme.images.share.connectDevice}
              style={{ alignSelf: 'center', marginTop: 20, marginBottom: 40 }}
            />
            {Object.values(devices).map(device => {
              return (
                <View key={device.deviceAddress}>
                  <TouchableOpacity
                    style={{
                      height: 40,
                      marginHorizontal: 40,
                      marginBottom: 26
                    }}
                    onPress={() => {
                      navigation.navigate('Pairing', { device });
                    }}
                  >
                    <View
                      style={{
                        flexDirection: 'row',
                        justifyContent: 'flex-start',
                        alignItems: 'center'
                      }}
                    >
                      <Image
                        source={
                          connected && device.deviceAddress === connected.deviceAddress
                            ? Theme.images.share.wifiSelectedIcon
                            : Theme.images.share.wifiIcon
                        }
                        style={{ marginRight: 20 }}
                      />
                      <Text
                        style={{
                          ...Theme.palette.h7,
                          color:
                            connected && device.deviceAddress === connected.deviceAddress
                              ? Theme.colors.mediaList.textHighlight
                              : Theme.colors.h6
                        }}
                      >
                        {device.deviceName ? device.deviceName : device.deviceAddress}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </View>
  );
};
