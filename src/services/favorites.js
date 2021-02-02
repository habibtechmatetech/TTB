/**
 * @flow
 */
import Constants from 'TTB/src/constants';
import { buildRestApiClient } from '../lib/connection';
import AuthManager from './auth';
import type { DefaultError } from '../lib/connection';
import type { Content } from '../lib/types';

const apiClient = buildRestApiClient();

const FavoritesManager = {};

export type GetFavoritesError = 'Getting Favorites Failed' | DefaultError;
FavoritesManager.getFavorites = async () => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.get(
      `${Constants.REST_API_URL_USERS}/mobile/profile/favorites`,
      { headers }
    );
    const content: [Content] = response.data;
    return content;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type AddToFavoritesError = 'Add To Favorites Failed' | DefaultError;
FavoritesManager.addToFavorites = async item => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.post(
      `${Constants.REST_API_URL_USERS}/mobile/profile/favorites`,
      item,
      { headers }
    );
    const content: [Content] = response.data;
    return content;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type RemoveFromFavoritesError = 'Remove From Favorites Failed' | DefaultError;
FavoritesManager.removeFromFavorites = async favoriteId => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.delete(
      `${Constants.REST_API_URL_USERS}/mobile/profile/favorites/${favoriteId}`,
      { headers }
    );
    return response;
  } catch (e) {
    throw new Error('server-error');
  }
};

export default FavoritesManager;
