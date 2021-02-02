/**
 * @flow
 */
import { createStackNavigator } from 'react-navigation-stack';
import SelectNetworkType from './screens/SelectNetworkType';
import CheckDevice from './screens/CheckDevice';
import ConnectToDevice from './screens/ConnectToDevice';
import Pairing from './screens/Pairing';
import Transferring from './screens/Transferring';

export default createStackNavigator(
  {
    SelectNetworkType: {
      screen: SelectNetworkType,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      }
    },
    CheckDevice: {
      screen: CheckDevice,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      }
    },
    ConnectToDevice: {
      screen: ConnectToDevice,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      }
    },
    Pairing: {
      screen: Pairing,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      }
    },
    Transferring: {
      screen: Transferring,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      }
    }
  },
  {
    initialRouteName: 'SelectNetworkType',
    mode: 'modal',
    headerMode: 'none'
  }
);
