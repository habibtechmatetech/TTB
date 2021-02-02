/**
 * @flow
 */
import { createStackNavigator } from 'react-navigation-stack';
import SignIn from '../../auth/screens/SignIn';
import SignUp from '../../auth/screens/SignUp';
import Onboarding from './Onboarding';

export default createStackNavigator(
  {
    Onboarding: {
      screen: Onboarding,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      },
      path: 'onboarding'
    },
    SignIn: {
      screen: SignIn,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      },
      path: 'signIn'
    },
    SignUp: {
      screen: SignUp,
      navigationOptions: {
        headerShown: false,
        headerTransparent: true
      },
      path: 'signUp'
    }
  },
  {
    headerBackTitleVisible: false
  }
);
