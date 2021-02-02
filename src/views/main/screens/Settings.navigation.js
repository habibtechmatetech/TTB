/**
 * @flow
 */
import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { Image } from 'react-native';
import Theme from 'TTB/src/theme/Theme';
import Settings from './Settings';
import ReportBug from './ReportBug';
import Edit from './Edit';
import SelectLanguage from '../../initial-flow/screens/SelectLanguage';

export default createStackNavigator(
  {
    Settings: {
      screen: Settings,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      }
    },
    Edit: {
      screen: Edit,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true,
        headerBackImage: (
          <Image
            style={{ ...Theme.palette.image, marginHorizontal: 10 }}
            source={Theme.images.back}
          />
        )
      }
    },
    ReportBug: {
      screen: ReportBug,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true,
        headerBackImage: (
          <Image
            style={{ ...Theme.palette.image, marginHorizontal: 10 }}
            source={Theme.images.back}
          />
        )
      }
    },
    Language: {
      screen: SelectLanguage,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      }
    }
  },
  {
    headerBackTitleVisible: false
  }
);
