/**
 * @flow
 */

import {
  REST_API_URL_USERS,
  REST_API_URL_CONTENT,
  REST_API_URL_NOTIFICATION,
  REST_API_TIMEOUT,
  TERMS_URL,
  PRIVACY_URL,
  WRITE_KEY,
  GOOGLE_SERVER_KEY,
  DONATIONS_URL,
  TEACHINGS_BASE_URL,
  STREAM_TEACHINGS
} from 'react-native-dotenv';

export const EMAIL_REGEX = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default {
  REST_API_URL_USERS,
  REST_API_URL_CONTENT,
  REST_API_URL_NOTIFICATION,
  REST_API_TIMEOUT: parseInt(REST_API_TIMEOUT, 10),

  TERMS_URL,
  PRIVACY_URL,
  DONATIONS_URL,
  TEACHINGS_BASE_URL,
  WRITE_KEY,
  GOOGLE_SERVER_KEY,
  STREAM_TEACHINGS,
  // overwrite with explicitly passed values
  ...process.env
};
