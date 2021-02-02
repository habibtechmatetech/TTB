/**
 * @flow
 */
import React from 'react';
import { createStackNavigator } from 'react-navigation-stack';
import { Image } from 'react-native';
import Theme from 'TTB/src/theme/Theme';
import Library from './Library';
import Playlist from './Playlist';

export default createStackNavigator(
  {
    Library: {
      screen: Library,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      },
      path: 'library'
    },
    Playlist: {
      screen: Playlist,
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
