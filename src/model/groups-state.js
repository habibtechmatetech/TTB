/**
 * @flow
 */

import { observable } from 'mobx';

export default class GroupsState {
  @observable
  showDevotionModal: boolean = false;

  @observable
  group: any = null;
}

export const groupsState = new GroupsState();
