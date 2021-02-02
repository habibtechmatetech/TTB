/**
 * @flow
 */
import React, { createContext, useEffect, useState, useCallback } from 'react';
import { PermissionsAndroid, Platform } from 'react-native';
import { getDeviceNameSync } from 'react-native-device-info';
import * as RNFS from 'react-native-fs';
import {
  initialize,
  isSuccessfulInitialize,
  startDiscoveringPeers,
  stopDiscoveringPeers,
  unsubscribeFromPeersUpdates,
  unsubscribeFromConnectionInfoUpdates,
  subscribeOnConnectionInfoUpdates,
  subscribeOnPeersUpdates,
  connect,
  disconnect,
  sendFile,
  sendMessage,
  getConnectionInfo,
  subscribeOnEvent,
  unsubscribeFromEvent,
  getAvailablePeers
} from '../../lib/p2p';
import type { Device } from '../../lib/types';
import DownloadsManager from '../../services/downloads';
import FileStorage from '../../lib/fileStorage';

const deviceName = getDeviceNameSync();

export const Context = createContext({});

export const Provider = ({ children }: { children: any }) => {
  const [initializing, setInitializing] = useState<boolean>(true);
  const [devices, setDevices] = useState<{ [string]: Device }>({});
  const [connected, setConnected] = useState<Device>(null);
  const [connection, setConnection] = useState<>(null);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [promptReceiveFile, setPromptReceiveFile] = useState(null);
  const [transferring, setTransferring] = useState(null);
  const [item, setItem] = useState(item);

  // eslint-disable-next-line no-console
  console.log(`--------P2P STATE ${deviceName} --------`);
  // eslint-disable-next-line no-console
  console.log('DEVICES LIST:', devices);
  // eslint-disable-next-line no-console
  console.log('Connected Device:', connected);
  // eslint-disable-next-line no-console
  console.log('connecting:', connecting);
  // eslint-disable-next-line no-console
  console.log('transferring:', transferring);
  // eslint-disable-next-line no-console
  console.log('item:', item);
  // eslint-disable-next-line no-console
  console.log(`--------END P2P STATE ${deviceName} --------`);

  useEffect(() => {
    async function _init() {
      if (Platform.OS === 'android' && initializing) {
        initialize();
        isSuccessfulInitialize()
          .then(status => {
            subscribeOnPeersUpdates(({ devices: newDevices }) => {
              updateDevices(newDevices);
            });
            subscribeOnConnectionInfoUpdates(info => {
              // eslint-disable-next-line no-console
              console.log('Getting new info:', info);
              setConnection(info);
            });
            onStartInvestigate();
            // eslint-disable-next-line no-console
            console.log(`status: ${status}`);
            setInitializing(false);
          })
          .catch(async e => {
            // eslint-disable-next-line no-console
            console.log('Initializing WifiP2P failed: ', e);
            setInitializing(false);
          });
      } else {
        setInitializing(false);
      }
    }
    if (initializing) {
      _init();
    }

    return () => {
      if (Platform.OS === 'android') {
        stopDiscoveringPeers()
          .then(() =>
            // eslint-disable-next-line no-console
            console.log('Stopping of discovering was successful')
          )
          .catch(err =>
            // eslint-disable-next-line no-console
            console.error(
              `Something is gone wrong. Maybe your WiFi is disabled? Error details`,
              err
            )
          );
        unsubscribeFromConnectionInfoUpdates(event =>
          // eslint-disable-next-line no-console
          console.log('unsubscribeFromConnectionInfoUpdates', event)
        );
        unsubscribeFromPeersUpdates((
          event // eslint-disable-next-line no-console
        ) => console.log('unsubscribeFromPeersUpdates', event));
      }
    };
  }, [updateDevices, initializing]);

  useEffect(() => {
    async function __fetch() {
      await getConnectionInfo();
      subscribeOnEvent('RECEIVE_MESSAGE', async event => {
        const messageData = JSON.parse(event.message);
        if (messageData) {
          switch (messageData.name) {
            case 'SendFile':
              setPromptReceiveFile(messageData.item);
              break;
            case 'Accept':
              // eslint-disable-next-line no-console
              console.log(`${deviceName} RECEIVED ACK MESSAGE`);
              // eslint-disable-next-line no-console
              console.log(`SENDING: ${item}`);
              try {
                if (item) {
                  await sendFile(item.url);
                  setTransferring({ status: 'done' });
                }
              } catch (e) {
                // eslint-disable-next-line no-console
                console.log('Upload file failed', e);
                setTransferring({ status: 'failed' });
              }
              break;
            case 'Reject':
              setTransferring({ status: 'failed' });
              break;
            default:
              break;
          }
        }
      });
      subscribeOnEvent('RECEIVE_FILE', async event => {
        if (event.error === 2) {
          // eslint-disable-next-line no-console
          console.log('Download file failed');
          setTransferring({ status: 'failed' });
          return;
        }
        // eslint-disable-next-line no-console
        console.log(`RECEIVING FILE: ${promptReceiveFile}`);
        if (!promptReceiveFile) {
          setTransferring({ status: 'failed' });
          return;
        }
        const fileName = promptReceiveFile.url.split('/').pop();
        let fileExtension = fileName.split('.').pop();
        if (fileExtension === fileName) {
          fileExtension = 'mp4';
        }
        const itemId = `${promptReceiveFile.id}.${fileExtension}`;
        const downloadedTrack = { ...promptReceiveFile };
        downloadedTrack.itemId = itemId;
        await DownloadsManager.addDownload(downloadedTrack);
        try {
          await RNFS.moveFile(event.uri, FileStorage.itemFilePath({ itemId }));
          setTransferring({ status: 'done' });
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('ERROR MOVING FILE:', e);
          setTransferring({ status: 'failed' });
        }
      });
    }
    if (connection) {
      __fetch();
    }
    return () => {
      unsubscribeFromEvent('RECEIVE_MESSAGE', () => {});
      unsubscribeFromEvent('RECEIVE_FILE', () => {});
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(connection), item, promptReceiveFile]);

  const onStartInvestigate = () => {
    PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION, {
      title: 'Access to wi-fi P2P mode',
      message: 'ACCESS_COARSE_LOCATION'
    })
      .then(granted => {
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          // eslint-disable-next-line no-console
          console.log('You can use the p2p mode');
        } else {
          // eslint-disable-next-line no-console
          console.log('Permission denied: p2p mode will not work');
        }
      })
      .then(() => {
        startDiscoveringPeers();
      })
      .then(() =>
        // eslint-disable-next-line no-console
        console.log(`Peers searching started`)
      )
      .catch(err =>
        // eslint-disable-next-line no-console
        console.error(`Something is gone wrong. Maybe your WiFi is disabled? Error details: ${err}`)
      );
  };

  const connectToDevice = async (device: Device) => {
    // eslint-disable-next-line no-console
    console.log('CONNECTING TO DEVICE!!!!: ', device);
    setTransferring(null);
    if (connected && connected.deviceAddress === device.deviceAddress) {
      return;
    }
    if (device.status !== 3) {
      return;
    }
    if (connecting) {
      return;
    }
    if (connected) {
      try {
        await disconnectFromDevice();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Disconnect from connect to device failed');
      }
    }
    setConnecting(true);
    try {
      await connect(device.deviceAddress);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Connecting failed: ', e);
      setConnecting(false);
    }
  };

  const disconnectFromDevice = async () => {
    if (promptReceiveFile) {
      sendMessage(JSON.stringify({ name: 'Reject' }));
    }
    if (connected) {
      setPromptReceiveFile(null);
      setTransferring(null);
      try {
        await disconnect();
        setConnected(null);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('failed disconnect: ', e);
      }
    }
  };

  const updateDevices = useCallback(
    newDevices => {
      let newDeviceList = newDevices || [];
      newDeviceList = {
        ...devices,
        ...newDeviceList.reduce((accumulator, device: Device) => {
          accumulator[device.deviceAddress] = device;
          return accumulator;
        }, {})
      };
      Object.values(newDeviceList).forEach(device => {
        if (device.status === 0) {
          setConnected(device);
          setConnecting(false);
        }
      });
      setDevices(newDeviceList);
    },
    [devices]
  );

  const downloadFile = async () => {
    try {
      // eslint-disable-next-line no-console
      console.log(`${deviceName} SENDING ACK`);
      sendMessage(JSON.stringify({ name: 'Accept' }));
      setTransferring({ status: 'transferring' });
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Download file failed', e);
      setTransferring({ status: 'failed' });
    }
  };

  const uploadFile = async () => {
    try {
      if (
        transferring &&
        (transferring.status === 'transferring' || transferring.status === 'done')
      ) {
        return;
      }
      if (!connected) {
        return;
      }
      const fileName = item.url.split('/').pop();
      let fileExtension = fileName.split('.').pop();
      if (fileExtension === fileName) {
        fileExtension = 'mp4';
      }
      const itemId = `${item.id}.${fileExtension}`;
      const isDownloaded = await FileStorage.itemFileIsDownloaded({ itemId });
      if (!isDownloaded) {
        await FileStorage.downloadItem({
          fromUrl: item.url,
          itemId
        });
      }
      setTransferring({ status: 'transferring' });
      // eslint-disable-next-line no-console
      console.log(`${deviceName} SENDING MESSAGE`);
      await sendMessage(JSON.stringify({ name: 'SendFile', item }));
      // eslint-disable-next-line no-console
      console.log(`${deviceName} WAITING FOR ACK MESSAGE`);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Upload file failed', e);
      setTransferring({ status: 'failed' });
    }
  };

  const discoverPeers = async () => {
    const { devices: newDevices } = await getAvailablePeers();
    updateDevices(newDevices);
  };

  const closePromptReceiveFile = () => {
    setPromptReceiveFile(null);
    setTransferring(null);
  };

  const p2pContext = {
    connect: connectToDevice,
    disconnect: disconnectFromDevice,
    discoverPeers,
    devices,
    connecting,
    connected,
    receiveFile: downloadFile,
    sendFile: uploadFile,
    promptReceiveFile,
    closePromptReceiveFile,
    transferring,
    setItem
  };

  return <Context.Provider value={p2pContext}>{initializing ? <></> : children}</Context.Provider>;
};

export const { Consumer } = Context;

export const withP2P = Component => {
  const ComponentToWrap = props => (
    <Consumer>
      {context => {
        // eslint-disable-next-line react/jsx-props-no-spreading
        return <Component p2p={context} {...props} />;
      }}
    </Consumer>
  );
  return ComponentToWrap;
};
