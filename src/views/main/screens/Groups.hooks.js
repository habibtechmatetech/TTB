/**
 * @flow
 */
import type { Group } from 'TTB/src/lib/types';
import { useEffect, useState, useCallback } from 'react';
import { STATE_PLAYING } from 'react-native-track-player';
import { t } from 'TTB/src/services/i18n';
import GroupsManager from '../../../services/groups';
import { EMAIL_REGEX } from '../../../constants';
import AudioManager from '../../../services/audio';

export const useGroup = (
  id
): ({ group: ?Group, loading: boolean, refresh: () => void, updateAudio: () => Promise<void> }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [group, setGroup] = useState<?Group>();

  const fetchData = useCallback(async () => {
    if (!id) {
      return;
    }
    setLoading(true);
    const newGroup = await GroupsManager.getGroup(id);
    setGroup(newGroup);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => {
    fetchData();
  };

  const updateAudio = async () => {
    const audioPosition = await AudioManager.trackPlayer.getPosition();
    const audioState = await AudioManager.trackPlayer.getState();
    await GroupsManager.updateAudio(
      id,
      audioPosition,
      audioState === STATE_PLAYING ? 'PLAYING' : 'PAUSED'
    );
  };

  return { group, loading, refresh, updateAudio };
};

export const useGroups = (
  userId: any,
  showCreated: boolean = false,
  hideInDevotion: boolean = false
): ({ groups: ?[Group], loading: boolean, refresh: () => void, createGroup: () => void }) => {
  const [groups, setGroups] = useState<?[Group]>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    let newGroups = await GroupsManager.getGroups(userId);
    // eslint-disable-next-line no-restricted-syntax
    for (const [index, group] of newGroups.entries()) {
      group.index = index;
      group.subtitle =
        group.membersCount === 1
          ? `1 ${t('groups.chatModalMemberSubtitleLabel')}`
          : `${group.membersCount} ${t('groups.chatModalMembersSubtitleLabel')}`;
    }
    if (showCreated) {
      newGroups = newGroups.filter(group => group.owner === userId);
    }
    if (hideInDevotion) {
      newGroups = newGroups.filter(group => !group.inDevotion);
    }
    setGroups(newGroups);
    setLoading(false);
  }, [hideInDevotion, showCreated, userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => {
    fetchData();
  };

  const createGroup = async data => {
    await GroupsManager.createGroups(data);
    fetchData();
  };

  return { groups, loading, refresh, createGroup };
};

export const useSearch = (text: string) => {
  const [members, setMembers] = useState(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function _init() {
      setLoading(true);
      const newMembers = await GroupsManager.searchMembers({
        searchTerm: text
      });
      if (text.match(EMAIL_REGEX)) {
        // if (newMembers.length < 1) {
        //   newMembers = [{ email: text }];
        // }
      }
      setMembers(newMembers);
      setLoading(false);
    }
    if (text) {
      _init();
    }
  }, [text]);

  return { loading, members };
};
