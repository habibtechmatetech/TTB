/**
 * @flow
 */

import * as React from 'react';
import { Image } from 'react-native';
import createAnimatedSwitchNavigator from 'react-navigation-animated-switch';
import { createStackNavigator } from 'react-navigation-stack';

import Theme from 'TTB/src/theme/Theme';

import SignUp from './screens/SignUp';
import SignIn from './screens/SignIn';
import ForgotPassword from './screens/ForgotPassword';
import FinishSetup from './screens/FinishSetup';

const SignInStack = createStackNavigator(
  {
    SignIn: {
      screen: SignIn,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      },
      path: 'login'
    },
    ForgotPassword: {
      screen: ForgotPassword,
      navigationOptions: {
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

const SignUpSignInSwitch = createAnimatedSwitchNavigator(
  {
    SignInStack: {
      screen: SignInStack,
      path: ''
    },
    SignUp,
    FinishSetup
  },
  {}
);

export default SignUpSignInSwitch;
