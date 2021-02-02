/**
 * @flow
 */
import { useCallback, useEffect, useState } from 'react';
import type { Audio } from 'TTB/src/lib/types';
import PlaylistManager from 'TTB/src/services/playlists';
import { showSuccessNotification } from '../../../lib/utils';
import { useStore } from '../../../model/root';
import { t } from '../../../services/i18n';

export function useFavorites(): ?{
  loading: boolean,
  refresh: any,
  deleteTrack: any,
  addTrack: any
} {
  const { favoritesState } = useStore();
  const [tracks, setTracks] = useState<?[Audio]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const favorites = favoritesState.favoritesList;
      let newTracks = await PlaylistManager.getPlaylistTracks(favorites);
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
  }, [favoritesState.favoritesList, loading]);

  useEffect(() => {
    fetchData();
  }, [favoritesState.favoritesList, fetchData]);

  const refresh = () => {
    fetchData();
  };

  const deleteTrack = (track: Audio) => {
    favoritesState.removeFromList(track);
    showSuccessNotification(t('alerts.favorites.remove'));
  };

  return { tracks, loading, refresh, deleteTrack };
}
