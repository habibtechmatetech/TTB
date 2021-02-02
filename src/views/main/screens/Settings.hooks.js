/**
 * @flow
 */

import { useEffect, useState, useCallback } from 'react';
import AuthManager from '../../../services/auth';

const useSettings = () => {
  const [profile, setProfile] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const response = await AuthManager.getProfile();
      setProfile(response);
    } catch {
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateProfile = async newProfile => {
    await AuthManager.updateProfile(newProfile);
    await fetchData();
  };

  const sendReport = async (subject, body) => {
    await AuthManager.sendReport(subject, body);
  };

  return { profile, updateProfile, sendReport };
};

export default useSettings;
