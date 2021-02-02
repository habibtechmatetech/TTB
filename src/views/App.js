/**
 * @flow
 */

import React from 'react';
import { View, StatusBar, Modal, TouchableOpacity, Text, Image } from 'react-native';
import KeyboardSpacer from 'react-native-keyboard-spacer';
import FlashMessage from 'react-native-flash-message';
import { createAppContainer } from 'react-navigation';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Theme from 'TTB/src/theme/Theme';
import { StoreProvider } from 'TTB/src/model/root';
import { t } from 'TTB/src/services/i18n';
import InitialFlow from './initial-flow/Navigation';
import { Provider, Consumer } from './sharing/Wifip2p';
import { useAppInitialization } from './App.hooks';

const prefix = 'ttb://';

/* Provide the store context for the app */
export default () => (
  <StoreProvider>
    <App uriPrefix={prefix} />
  </StoreProvider>
);

/* MARK: - Layout Styles */

const layoutStyles = {
  mainContainer: {
    flex: 1,
    backgroundColor: Theme.colors.background
  },
  // safe for notches
  keyboardNegativeSpacing: 0
};

/* MARK: - UI Components */

const NavigationStack = createAppContainer(InitialFlow);

const App = () => {
  /* Hooks */
  const initializing = useAppInitialization();

  /* Render */
  return (
    <SafeAreaProvider>
      <View style={{ ...layoutStyles.mainContainer }}>
        <StatusBar barStyle="dark-content" />
        <Provider>
          {initializing ? (
            <></>
          ) : (
            <>
              <NavigationStack />
              <Consumer>
                {({
                  promptReceiveFile,
                  transferring,
                  receiveFile,
                  disconnect,
                  closePromptReceiveFile
                }) => {
                  if (promptReceiveFile) {
                    return (
                      <Modal animationType="slide" transparent visible onRequestClose={disconnect}>
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
                                opacity: transferring ? 1 : 0
                              }}
                            >
                              {transferring && (
                                <Image
                                  source={
                                    // eslint-disable-next-line no-nested-ternary
                                    transferring.status === 'transferring'
                                      ? Theme.images.downloading
                                      : transferring.status === 'done'
                                      ? Theme.images.downloadComplete
                                      : Theme.images.downloadFailed
                                  }
                                />
                              )}
                            </View>
                            <Text
                              style={{
                                ...Theme.palette.h2,
                                textAlign: 'center',
                                marginHorizontal: 20,
                                marginBottom: 40
                              }}
                            >
                              {!transferring && t('app.sendAFile')}
                              {transferring &&
                                transferring.status === 'done' &&
                                t('app.downloadComplete')}
                              {transferring &&
                                transferring.status === 'transferring' &&
                                t('app.downloading')}
                              {transferring &&
                                transferring.status === 'failed' &&
                                t('app.downloadFailed')}
                            </Text>
                          </View>

                          <View>
                            {transferring &&
                              (transferring.status === 'failed' ||
                                transferring.status === 'done') && (
                                <TouchableOpacity
                                  onPress={() => {
                                    if (transferring.status === 'done') {
                                      closePromptReceiveFile();
                                    } else {
                                      disconnect();
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
                                    marginBottom: 34,
                                    flexDirection: 'row',
                                    alignSelf: 'center'
                                  }}
                                >
                                  <Text style={Theme.palette.closeText}>{t('app.close')}</Text>
                                </TouchableOpacity>
                              )}
                            {!transferring && (
                              <>
                                <TouchableOpacity
                                  onPress={receiveFile}
                                  style={{
                                    height: 50,
                                    width: '80%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 12,
                                    backgroundColor: Theme.colors.button,
                                    marginLeft: 32,
                                    marginRight: 32,
                                    marginBottom: 16,
                                    flexDirection: 'row',
                                    alignSelf: 'center'
                                  }}
                                >
                                  <Text style={Theme.palette.closeText}>{t('app.accept')}</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                  onPress={disconnect}
                                  style={{
                                    height: 50,
                                    width: '80%',
                                    justifyContent: 'center',
                                    alignItems: 'center',
                                    borderRadius: 12,
                                    backgroundColor: Theme.colors.button,
                                    marginLeft: 32,
                                    marginRight: 32,
                                    marginTop: 16,
                                    marginBottom: 34,
                                    flexDirection: 'row',
                                    alignSelf: 'center'
                                  }}
                                >
                                  <Text style={Theme.palette.closeText}>{t('app.reject')}</Text>
                                </TouchableOpacity>
                              </>
                            )}
                          </View>
                        </View>
                      </Modal>
                    );
                  }
                  return <></>;
                }}
              </Consumer>
            </>
          )}
        </Provider>
        <KeyboardSpacer topSpacing={layoutStyles.keyboardNegativeSpacing} />
        <FlashMessage position="top" />
      </View>
    </SafeAreaProvider>
  );
};
