/**
 * @flow
 */
import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { Image } from 'react-native';
import Theme from 'TTB/src/theme/Theme';
import Teachings from './Teachings';
import Journey from './Journey';
import Search from './Search';
import Collection from './Collection';
import Chapter from './Chapter';

export default createStackNavigator(
  {
    Teachings: {
      screen: Teachings,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      }
    },
    Collection: {
      screen: Collection,
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
    Search: {
      screen: Search,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      }
    },
    Journey: {
      screen: Journey,
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
    Chapter: {
      screen: Chapter,
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
    }
  },
  {
    headerBackTitleVisible: false
  }
);
