/**
 * @flow
 */

import * as React from 'react';

import FavoritesState, { favoritesState } from './favorites-state';
import PlaylistsState, { playlistsState } from './playlists-state';
import GroupsState, { groupsState } from './groups-state';
import SettingsState, { settingsState } from './settings-state';
import UIState, { uiState } from './ui-state';

/* ROOT STORE */
export type Store = {|
  favoritesState: FavoritesState,
  playlistsState: PlaylistsState,
  groupsState: GroupsState,
  settingsState: SettingsState,
  uiState: UIState
|};
const RootStore: Store = {
  favoritesState,
  playlistsState,
  groupsState,
  settingsState,
  uiState
};

/* CONTEXT: 'Singleton' container */
const StoreContext = React.createContext<Store>(RootStore);

/* STORE PROVIDER: stores the root store instance */
export const StoreProvider = ({ children }: { children: React.Node }) => {
  return <StoreContext.Provider value={RootStore}>{children}</StoreContext.Provider>;
};

/* STORE CONSUMER: Hook that consumes the context */
export function useStore(): Store {
  const store = React.useContext(StoreContext);
  if (!store) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return store;
}

/* LOG SETUP FOR MobX models */
// spy(event => {
//   if (__DEV__) {
//     console.log(`${event.type}`)
//   }
// });
