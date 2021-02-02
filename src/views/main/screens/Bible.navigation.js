/**
 * @flow
 */
import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { Image } from 'react-native';
import Theme from 'TTB/src/theme/Theme';
import Bible from './Bible';
import Chapter from './Chapter';
import Search from './Search';

export default createStackNavigator(
  {
    Bible: {
      screen: Bible,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      },
      path: 'bible'
    },
    Search: {
      screen: Search,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
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
