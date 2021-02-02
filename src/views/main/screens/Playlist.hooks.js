/**
 * @flow
 */
import { useCallback, useEffect, useState } from 'react';
import type { Audio } from 'TTB/src/lib/types';
import PlaylistManager from 'TTB/src/services/playlists';
import { t } from 'TTB/src/services/i18n';
import { showSuccessNotification } from '../../../lib/utils';
import type { Playlist } from '../../../lib/types';
import { useStore } from '../../../model/root';

export function usePlaylist(
  playlist: Playlist
): ?{ tracks: ?[Audio], loading: boolean, refresh: any, deleteTrack: any, updateTrack: any } {
  const { playlistsState } = useStore();
  const [tracks, setTracks] = useState<?[Audio]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    if (loading) {
      return;
    }
    setLoading(true);
    try {
      const playlists = playlistsState.getPlaylists;
      const playlistIndex = playlists.findIndex(
        element =>
          (playlist.id && element.id === playlist.id) ||
          (!playlist.id && element.offlineId === playlist.offlineId)
      );
      let newTracks = await PlaylistManager.getPlaylistTracks(playlists[playlistIndex].items);
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
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData, playlistsState]);

  const refresh = () => {
    fetchData();
  };

  const removeTrackFromPlaylist = (track: Audio) => {
    playlistsState.removeTrackFromPlaylist(playlist, track);
    showSuccessNotification(t('alerts.playlists.delete'));
  };

  const updateTracks = () => {
    const newPlaylist = {
      ...playlist,
      items: tracks.map(item => {
        return {
          id: item.id,
          itemType: item.itemType,
          contentId: item.contentId
        };
      })
    };
    playlistsState.updatePlaylist(newPlaylist);
  };

  const updateUnsavedTracks = (newTracks: [Audio]) => {
    setTracks(newTracks);
  };

  return { tracks, loading, refresh, removeTrackFromPlaylist, updateTracks, updateUnsavedTracks };
}
