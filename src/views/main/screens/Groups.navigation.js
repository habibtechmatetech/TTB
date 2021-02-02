/**
 * @flow
 */
import { createStackNavigator } from 'react-navigation-stack';
import Groups from './Groups';
import Chat from './Chat';

export default createStackNavigator(
  {
    Groups: {
      screen: Groups,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      },
      path: 'groups'
    },
    Chat: {
      screen: Chat,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      },
      path: 'chat'
    }
  },
  {
    headerBackTitleVisible: false
  }
);
