/**
 * @flow
 */

import AsyncStorage from '@react-native-community/async-storage';
import analytics from '@segment/analytics-react-native';
import { buildRestApiClient } from 'TTB/src/lib/connection';
import type { DefaultError } from 'TTB/src/lib/connection';
import Constants from 'TTB/src/constants';

const AuthManager = {};

export type UserInfo = {|
  verified: boolean,
  email: string,
  isPrivate: boolean
|};

const apiClient = buildRestApiClient();

/* TOKEN MANAGEMENT */

const TOKEN_STORAGE_KEY = 'auth-token';

AuthManager.tokenCredentials = null;

AuthManager.init = async () => {
  AuthManager.tokenCredentials = await AsyncStorage.getItem(TOKEN_STORAGE_KEY);
};

/* MARK: - Helper functions */

async function setCredentials(token: string) {
  AuthManager.tokenCredentials = token;
  await AsyncStorage.setItem(TOKEN_STORAGE_KEY, token);
}

/* RESET PASSWORD */

export type ResetPasswordError = 'email-not-found' | DefaultError;
AuthManager.resetPassword = async (email: string) => {
  try {
    await apiClient.post(`${Constants.REST_API_URL_USERS}/mobile/auth/forgotPassword`, { email });
  } catch (err) {
    if (err.response && err.response.status === 404) {
      throw new Error('email-not-found');
    } else {
      throw new Error('server-error');
    }
  }
};

/* MAIL SIGN UP / SIGN IN */

export type SignUpError = 'email-exists' | DefaultError;
AuthManager.signUpWithEmail = async (
  email: string,
  password: string,
  isPrivate: boolean
): Promise<UserInfo> => {
  try {
    const data = {
      email,
      privateProfile: isPrivate,
      password
    };
    await apiClient.post(`${Constants.REST_API_URL_USERS}/mobile/auth/signup`, data);
  } catch (err) {
    if (
      err.response &&
      err.response.status === 400 &&
      err.response.data &&
      err.response.data.message &&
      err.response.data.message.indexOf('already registered') !== -1
    ) {
      throw new Error('email-exists');
    } else {
      throw new Error('server-error');
    }
  }
};

export type SignInError = 'invalid-credentials' | DefaultError;
AuthManager.signInWithEmail = async (email: string, password: string): Promise<UserInfo> => {
  try {
    const response = await apiClient.post(`${Constants.REST_API_URL_USERS}/mobile/auth/login`, {
      email,
      password
    });
    setCredentials(response.data.accessToken);
    const user = await AuthManager.getUserInfo();
    if (user == null) {
      throw new Error('server-error');
    }
    return user;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      throw new Error('invalid-credentials');
    } else {
      throw new Error('server-error');
    }
  }
};

export type SignInProviderError = 'invalid-token' | DefaultError;
AuthManager.signInWithProvider = async (provider: string, token: string): Promise<UserInfo> => {
  try {
    const response = await apiClient.post(
      `${Constants.REST_API_URL_USERS}/mobile/auth/token/${provider}`,
      {
        accessToken: token
      }
    );
    setCredentials(response.data.accessToken);
    const user = await AuthManager.getUserInfo();
    if (user == null) {
      throw new Error('server-error');
    }
    return user;
  } catch (err) {
    if (err.response && err.response.status === 401) {
      throw new Error('invalid-token');
    } else {
      throw new Error('server-error');
    }
  }
};

/* GET USER INFO */
AuthManager.getUserInfo = async (): Promise<?UserInfo> => {
  if (AuthManager.tokenCredentials == null) {
    return null;
  }

  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const { data } = await apiClient.get(`${Constants.REST_API_URL_USERS}/mobile/profile`, {
      headers
    });
    return {
      verified: true,
      email: data.email,
      isPrivate: data.privateProfile,
      id: data.id
    };
  } catch (err) {
    return null;
  }
};

/* GET PROFILE */
AuthManager.getSettingsProfile = async () => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const { data } = await apiClient.get(`${Constants.REST_API_URL_USERS}/mobile/profile`, {
      headers
    });
    const { email, username, language, autoPlay, downloadOnlyOnWifi, notifications } = data;
    return {
      email,
      username,
      language,
      autoPlay,
      downloadOnlyOnWifi,
      notifications
    };
  } catch (err) {
    throw new Error('server-error');
  }
};

/* UPDATE PROFILE */
AuthManager.updateSettingsProfile = async profile => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.put(
      `${Constants.REST_API_URL_USERS}/mobile/profile`,
      profile,
      { headers }
    );
    const { data } = response;
    return data;
  } catch (e) {
    throw new Error('server-error');
  }
};

/* SEND REPORT */
AuthManager.sendReport = async (subject, body) => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.post(
      `${Constants.REST_API_URL_USERS}/mobile/profile/report`,
      {
        subject,
        body
      },
      { headers }
    );
    const { data } = response;
    return data;
  } catch (e) {
    throw new Error('server-error');
  }
};

/* SIGN OUT */

AuthManager.signOut = async () => {
  analytics.track('User Logout');
  AuthManager.tokenCredentials = null;
  await AsyncStorage.removeItem(TOKEN_STORAGE_KEY);
};

export default AuthManager;
