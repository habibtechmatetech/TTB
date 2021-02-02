/**
 * @flow
 */
import { useCallback, useEffect, useState } from 'react';
import type { Audio } from 'TTB/src/lib/types';
import { useStore } from 'TTB/src/model/root';
import TeachingsManager from '../../../services/teachings';

export function useCollection(
  bookId: string
): ?{ tracks: ?[Audio], loading: boolean, refresh: any, deleteTrack: any, updateTrack: any } {
  const { settingsState } = useStore();
  const [tracks, setTracks] = useState<?[Audio]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      let newTracks = await TeachingsManager.searchTeachings({
        language: settingsState.settingsProfile.language,
        bibleBook: [bookId]
      });
      newTracks = newTracks.map((track, index) => {
        return {
          ...track,
          order: index
        };
      });
      setTracks(newTracks);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookId, settingsState.settingsProfile.language]);

  useEffect(() => {
    fetchData();
  }, [fetchData, bookId]);

  const refresh = () => {
    fetchData();
  };

  return { tracks, loading, refresh };
}
