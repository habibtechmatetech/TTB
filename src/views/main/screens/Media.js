/**
 * @flow
 */

import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity } from 'react-native';
import RNFS from 'react-native-fs';
import Theme from 'TTB/src/theme/Theme';
import EStyleSheet from 'react-native-extended-stylesheet';
import { t } from 'TTB/src/services/i18n';
import { observer } from 'mobx-react';
import { useStore } from 'TTB/src/model/root';

const styles = EStyleSheet.create({
  container: {
    marginTop: 32,
    marginLeft: 20,
    flexDirection: 'row'
  },
  sectionLabel: {
    fontFamily: 'Noto Serif',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: 0.1,
    color: '#161B25'
  },
  itemLabel: {
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18,
    color: '#424F78'
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
  },
  divider: {
    height: 1,
    marginTop: 32,
    backgroundColor: Theme.colors.divider
  },
  switchItemContainer: {
    marginTop: 32,
    marginLeft: 20,
    marginRight: 30,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  storageItemContainer: {
    marginTop: 32,
    marginLeft: 20,
    marginRight: 30,
    flexDirection: 'row',
    alignItems: 'flex-start'
  },
  storageItemLabel: {
    flexGrow: 0,
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: '500',
    fontSize: 13,
    lineHeight: 18,
    color: '#424F78'
  },
  storageProgressContainer: {
    flexGrow: 1,
    marginLeft: 20
  },
  storageProgressBarBackground: {
    width: '100%',
    height: 5,
    marginTop: 5,
    backgroundColor: '#FFFFFF'
  },
  storageProgressBar: {
    height: 5,
    backgroundColor: '#006FA1'
  },
  storageProgressLabel: {
    marginTop: 10,
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 12,
    lineHeight: 16,
    color: '#424F78'
  }
});

const Media = () => {
  const { settingsState } = useStore();
  const [autoPlayOn, setAutoPlayOn] = useState(false);
  const [downloadOnlyOnWifiOn, setDownloadOnlyOnWifiOn] = useState(false);
  const [freeSpaceGB, setFreeSpaceGB] = useState(0);
  const [totalSpaceGB, setTotalSpaceGB] = useState(0);

  RNFS.getFSInfo().then(info => {
    setFreeSpaceGB(Math.floor(info.freeSpace / (1024 * 1024 * 1024)));
    setTotalSpaceGB(Math.floor(info.totalSpace / (1024 * 1024 * 1024)));
  });

  useEffect(() => {
    setAutoPlayOn(settingsState.settingsProfile && settingsState.settingsProfile.autoPlay);
    setDownloadOnlyOnWifiOn(
      settingsState.settingsProfile && settingsState.settingsProfile.downloadOnlyOnWifi
    );
  }, [settingsState.settingsProfile]);

  return (
    <ScrollView>
      {/* Audio */}
      <View style={{ ...styles.container }}>
        <Text style={{ ...styles.sectionLabel }}>{t('settings.media.audio')}</Text>
      </View>
      <View style={{ ...styles.switchItemContainer }}>
        <Text style={{ ...styles.itemLabel }}>{t('settings.media.autoplay')}</Text>
        <Switch
          value={autoPlayOn}
          onValueChange={() => {
            const newProfile = {
              ...settingsState.settingsProfile,
              autoPlay: !autoPlayOn
            };
            settingsState.updateSettingsProfile(newProfile);
            setAutoPlayOn(!autoPlayOn);
          }}
        />
      </View>
      <View style={{ ...styles.divider }} />

      {/* Storage */}
      <View style={{ ...styles.container }}>
        <Text style={{ ...styles.sectionLabel }}>{t('settings.media.storage')}</Text>
      </View>
      <View style={{ ...styles.switchItemContainer }}>
        <Text style={{ ...styles.itemLabel }}>{t('settings.media.downloadWifi')}</Text>
        <Switch
          value={downloadOnlyOnWifiOn}
          onValueChange={() => {
            const newProfile = {
              ...settingsState.settingsProfile,
              downloadOnlyOnWifi: !downloadOnlyOnWifiOn
            };
            settingsState.updateSettingsProfile(newProfile);
            setDownloadOnlyOnWifiOn(!downloadOnlyOnWifiOn);
          }}
        />
      </View>
      <View style={{ ...styles.storageItemContainer }}>
        <Text style={{ ...styles.storageItemLabel }}>{t('settings.media.storage')}</Text>
        <View style={{ ...styles.storageProgressContainer }}>
          <View style={{ ...styles.storageProgressBarBackground }}>
            <View
              style={{ ...styles.storageProgressBar }}
              width={`${(freeSpaceGB * 100) / totalSpaceGB}%`}
            />
          </View>
          <Text style={{ ...styles.storageProgressLabel }}>
            {`${freeSpaceGB}GB / ${totalSpaceGB}GB`}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        onPress={async () => {
          if (await RNFS.exists(`${RNFS.DocumentDirectoryPath}/cache`)) {
            await RNFS.unlink(`${RNFS.DocumentDirectoryPath}/cache`);
          }
        }}
      >
        <View style={{ ...styles.buttonContainer }}>
          <Text style={{ ...styles.buttonText }}>{t('settings.media.deleteCache')}</Text>
        </View>
      </TouchableOpacity>
      <View style={{ ...styles.divider }} />
    </ScrollView>
  );
};

export default observer(Media);
