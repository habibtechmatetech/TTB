/**
 * @flow
 */

import * as axios from 'axios';

import Constants from 'TTB/src/constants';

export const TIMEOUT_ERROR_CODE = 'TIMEOUT';
export type DefaultError = 'server-error';

export function buildRestApiClient() {
  const instance = axios.create({
    timeout: Constants.REST_API_TIMEOUT
  });

  // detect timeout and use our own error code...
  instance.interceptors.response.use(
    config => config,
    error => {
      if (error) {
        if (
          (error.response && error.response.status === 408) ||
          error.code === 'ECONNABORTED' ||
          (error.code && error.code.toLowerCase().match(/nsurlerrordomain/))
        ) {
          const err = Error('Request timed out');
          // $FlowFixMe
          err.code = TIMEOUT_ERROR_CODE;
          return Promise.reject(err);
        }
      }
      // this is here on purpose! Will help with debugging
      return Promise.reject(error);
    }
  );

  return instance;
}

export const restApiClientInstance = buildRestApiClient();
