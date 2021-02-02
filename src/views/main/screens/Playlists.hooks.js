/**
 * @flow
 */
import type { Playlist } from 'TTB/src/lib/types';
import { useCallback, useEffect, useState } from 'react';
import { t } from 'TTB/src/services/i18n';
import { useStore } from '../../../model/root';

export function usePlaylists(): ?[Playlist] {
  const { playlistsState } = useStore();
  const [playlists, setPlaylists] = useState<?[Playlist]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      let newPlaylists = playlistsState.getPlaylists;
      newPlaylists = newPlaylists.map((playlist, index) => {
        return {
          ...playlist,
          subtitle: `${playlist.items.length} ${t('playlists.tracksLabel')}`,
          order: index
        };
      });
      setPlaylists(newPlaylists);
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log(e);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(playlistsState.getPlaylists), loading]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchData]);

  const refresh = () => {
    fetchData();
  };

  return { playlists, refresh, loading };
}
