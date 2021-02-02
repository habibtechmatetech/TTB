/**
 * @flow
 */
import { useEffect, useState, useCallback } from 'react';
import GroupsManager from 'TTB/src/services/groups';

export function useGroupSettings(group: any) {
  const [members, setMembers] = useState<?[any]>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    if (group) {
      setLoading(true);
      const newGroupMembers = await GroupsManager.getGroupMembers(group.id);
      setMembers(newGroupMembers);
      setLoading(false);
    }
  }, [group]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refresh = () => {
    fetchData();
  };

  const deleteGroup = async () => {
    await GroupsManager.deleteGroup(group.id);
  };

  const deleteGroupMember = async memberId => {
    await GroupsManager.deleteGroupMember(group.id, memberId);
    fetchData();
  };

  const inviteGroupMembers = async memberIds => {
    await GroupsManager.inviteGroupMembers(group.id, memberIds);
    fetchData();
  };

  const stopDevotion = async () => {
    await GroupsManager.stopDevotion(group.id);
  };

  return {
    members,
    loading,
    refresh,
    deleteGroup,
    deleteGroupMember,
    inviteGroupMembers,
    stopDevotion
  };
}
