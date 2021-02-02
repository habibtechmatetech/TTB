/**
 * @flow
 */

import { observable, computed } from 'mobx';

import AuthManager from 'TTB/src/services/auth';
import type { UserInfo } from 'TTB/src/services/auth';

export default class UIState {
  @observable
  user: ?UserInfo = null;

  @computed
  get isAuthenticated(): boolean {
    return this.user != null;
  }

  async signOut() {
    await AuthManager.signOut();
    this.user = null;
  }
}

export const uiState = new UIState();
