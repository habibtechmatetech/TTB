/**
 * @flow
 */
import Constants from 'TTB/src/constants';
import { buildRestApiClient, DefaultError } from '../lib/connection';
import AuthManager from './auth';
import type { Content } from '../lib/types';

const apiClient = buildRestApiClient();

const GroupsManager = {};

export type GetGroupError = 'Getting Group Failed' | DefaultError;
GroupsManager.getGroup = async id => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.get(`${Constants.REST_API_URL_USERS}/group/${id}`, {
      headers
    });
    return response.data;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type GetGroupsError = 'Getting Groups Failed' | DefaultError;
GroupsManager.getGroups = async userId => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.get(`${Constants.REST_API_URL_USERS}/group?member=${userId}`, {
      headers
    });
    const { content }: { content: [Content] } = response.data;
    return content;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type GetGroupMembersError = 'Get Group Members Failed' | DefaultError;
GroupsManager.getGroupMembers = async groupId => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.get(
      `${Constants.REST_API_URL_USERS}/group/${groupId}/members`,
      { headers }
    );
    return response.data;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type CreateGroupsError = 'Create Groups Failed' | DefaultError;
GroupsManager.createGroups = async item => {
  const create = {
    name: item.name,
    description: item.description,
    approvalNeeded: item.approval,
    members: item.members,
    public: item.privacy
  };

  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.post(`${Constants.REST_API_URL_USERS}/group`, create, {
      headers
    });
    const content: [Content] = response.data;
    return content;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e.response);
    throw new Error('server-error');
  }
};

export type DeleteGroupError = 'Delete Group Failed' | DefaultError;
GroupsManager.deleteGroup = async groupId => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.delete(`${Constants.REST_API_URL_USERS}/group/${groupId}`, {
      headers
    });
    return response;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type DeleteGroupMemberError = 'Delete Group Member Failed' | DefaultError;
GroupsManager.deleteGroupMember = async (groupId, memberId) => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.delete(
      `${Constants.REST_API_URL_USERS}/group/${groupId}/members/${memberId}`,
      {
        headers
      }
    );
    return response;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type StartGroupDevotionError = 'Start Group Devotion Failed' | DefaultError;
GroupsManager.startDevotion = async (groupId, contentId) => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.post(
      `${Constants.REST_API_URL_USERS}/group/${groupId}/startDevotion`,
      { contentId },
      { headers }
    );
    return response;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type StopGroupDevotionError = 'Stop Group Devotion Failed' | DefaultError;
GroupsManager.stopDevotion = async groupId => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.post(
      `${Constants.REST_API_URL_USERS}/group/${groupId}/stopDevotion`,
      {},
      { headers }
    );
    return response;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type UpdateGroupAudioError = 'Update Group Audio Failed' | DefaultError;
GroupsManager.updateAudio = async (
  groupId,
  audioPosition: number,
  audioStatus: 'PLAYING' | 'PAUSED'
) => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.patch(
      `${Constants.REST_API_URL_USERS}/group/${groupId}/audioInfo`,
      { audioPosition, audioStatus },
      { headers }
    );
    return response;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type InviteGroupMemberError = 'Invite Group Member Failed' | DefaultError;
GroupsManager.inviteGroupMembers = async (groupId, members: [number]) => {
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.post(
      `${Constants.REST_API_URL_USERS}/group/${groupId}/members/`,
      { members },
      {
        headers
      }
    );
    return response;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type SearchMembersError = 'Search Teachings Failed' | DefaultError;
GroupsManager.searchMembers = async ({ searchTerm }: { searchTerm: ?string }): Promise => {
  const search = {
    searchTerm,
    mobileUserPager: {
      page: 1,
      perPage: 20,
      sortDir: 'ASC'
    }
  };
  try {
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const response = await apiClient.post(
      `${Constants.REST_API_URL_USERS}/mobile/user/search`,
      search,
      { headers }
    );
    const members = response.data.content;
    return members;
  } catch (e) {
    throw new Error('server-error');
  }
};

export default GroupsManager;
