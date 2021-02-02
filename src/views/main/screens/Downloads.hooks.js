/**
 * @flow
 */
import { useCallback, useEffect, useState } from 'react';
import analytics from '@segment/analytics-react-native';
import { t } from 'TTB/src/services/i18n';
import type { Audio, Content } from '../../../lib/types';
import DownloadsManager from '../../../services/downloads';

import FileStorage from '../../../lib/fileStorage';
import type { AddToPlaylistError } from '../../../services/playlists';
import { showErrorNotification, showSuccessNotification } from '../../../lib/utils';

export function useDownloads(): ?{
  downloads: ?[Content],
  loading: boolean,
  refresh: any,
  deleteTrack: any,
  addTrack: any,
  downloading: boolean,
  progress: Number
} {
  const [downloads, setDownloads] = useState<?[Content]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  const fetchData = useCallback(async () => {
    if (!loading) {
      setLoading(true);
      const newDownloads = await DownloadsManager.getDownloads();
      setDownloads(newDownloads);
      setLoading(false);
    }
  }, [loading]);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refresh = () => {
    fetchData();
  };

  const deleteTrack = async (track: Audio) => {
    try {
      const { contentId } = track;
      const newDownloads = downloads.filter(download => download.contentId !== contentId);
      await DownloadsManager.removeDownload(contentId);
      await FileStorage.deleteItem({ itemId: track.itemId });
      setDownloads(newDownloads);
      showSuccessNotification(t('alerts.downloads.remove'));
    } catch (e) {
      const error: AddToPlaylistError = e.message;
      if (error === 'server-error') {
        showErrorNotification(t('uiControls.notification.serverError'));
      }
    }
  };

  const addTrack = async (track: [Audio]) => {
    setDownloading(true);
    try {
      setProgress(0);
      let fileExtension;
      if (track.file && track.file.mimeType) {
        fileExtension = track.file.mimeType;
      } else {
        const fileName = track.url.split('/').pop();
        fileExtension = fileName.split('.').pop();
        if (fileExtension === fileName) {
          fileExtension = 'mp4';
        }
      }
      const itemId = `${track.id}.${fileExtension}`;
      const isDownloaded = await FileStorage.itemFileIsDownloaded({ itemId });
      if (!isDownloaded) {
        await FileStorage.downloadItem({
          fromUrl: track.url,
          itemId,
          progressListener: value => {
            setProgress(value);
          }
        });
      }
      const downloadedTrack = { ...track };
      downloadedTrack.itemId = itemId;
      const download = await DownloadsManager.addDownload(downloadedTrack);
      setDownloads([...downloads, download]);
      analytics.track('Track Downloaded', {
        id: track.id,
        url: track.url,
        title: track.title,
        artist: track.artist,
        itemType: track.itemType,
        contentId: track.contentId
      });
    } catch (e) {
      const error: AddToPlaylistError = e.message;
      if (error === 'server-error') {
        showErrorNotification(t('uiControls.notification.serverError'));
      }
    }
    setDownloading(false);
  };

  return {
    tracks: downloads,
    loading,
    refresh,
    deleteTrack,
    addTrack,
    downloading,
    progress
  };
}

export function useDownload(
  track
): ?{
  isDownloaded: boolean,
  loading: boolean,
  refresh: any,
  deleteDownload: any,
  addDownload: any
} {
  const { tracks, loading, refresh, deleteTrack, addTrack, progress } = useDownloads();
  const [isDownloaded, setIsDownloaded] = useState<boolean>(false);

  useEffect(() => {
    if (track) {
      const newTrackDownload = tracks.some(element => {
        return element.contentId === track.contentId;
      });
      setIsDownloaded(newTrackDownload);
    }
  }, [track, tracks]);

  const deleteCurrentTrack = () => {
    deleteTrack(track);
    setIsDownloaded(false);
  };

  const addCurrentTrack = () => {
    addTrack(track);
    setIsDownloaded(true);
  };

  return {
    isDownloaded,
    loading,
    refresh,
    deleteDownload: deleteCurrentTrack,
    addDownload: addCurrentTrack,
    progress
  };
}
