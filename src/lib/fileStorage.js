import * as RNFS from 'react-native-fs';
import AsyncStorage from '@react-native-community/async-storage';

import Constants from 'TTB/src/constants';
import { TIMEOUT_ERROR_CODE } from 'TTB/src/lib/connection';

export default class FileStorage {
  /* MARK: - Constants */

  static FILE_CHECK_STORAGE_KEY = 'FILE_KEY_';

  /* MARK: - Services */

  static downloadItem = async data => {
    const { itemId, fromUrl, progressListener } = data;

    const fileExists = await FileStorage._itemFileExists({ itemId });
    if (fileExists) {
      await FileStorage.deleteItem({ itemId });
    }

    const downloadsFolderExists = await RNFS.exists(`${RNFS.DocumentDirectoryPath}/downloads`);
    if (!downloadsFolderExists) {
      await RNFS.mkdir(`${RNFS.DocumentDirectoryPath}/downloads`);
    }

    let lastReportedProgress;
    let lastReportedProgressPerc = 0;
    const reportDivider = 1; // report every 1% to the listener
    let interval;
    let rejectSignal;
    const rejectablePromise = new Promise((resolve, reject) => {
      rejectSignal = reject;
    });
    try {
      const result = RNFS.downloadFile({
        fromUrl,
        toFile: FileStorage.itemFilePath({ itemId }),
        cacheable: false,
        connectionTimeout: Constants.REST_API_TIMEOUT,
        readTimeout: Constants.REST_API_TIMEOUT,
        progressDivider: 0,
        begin: () => {
          lastReportedProgress = Date.now();
          interval = setInterval(() => {
            if (Date.now() - lastReportedProgress > Constants.REST_API_TIMEOUT) {
              clearInterval(interval);
              RNFS.stopDownload(result.jobId);

              const error = Error('Download staled');
              error.code = TIMEOUT_ERROR_CODE;
              rejectSignal(error);
            }
          }, Constants.REST_API_TIMEOUT);
        },
        progress: res => {
          lastReportedProgress = Date.now();

          if (progressListener) {
            const pro = Math.round(100 * (res.bytesWritten / res.contentLength));

            if (pro - lastReportedProgressPerc >= reportDivider) {
              lastReportedProgressPerc = pro;
              progressListener(pro);
            }
          }
        }
      });

      const downloadResult = await Promise.race([result.promise, rejectablePromise]);
      if (interval) {
        clearInterval(interval);
      }
      if (downloadResult.statusCode !== 200) {
        throw Error('Error writing file');
      }

      await FileStorage._saveItemChecksum({
        itemId,
        fileLength: downloadResult.bytesWritten
      });
    } catch (err) {
      FileStorage.deleteItem({ itemId });

      throw err;
    }
  };

  static itemFileIsDownloaded = async data => {
    const { itemId } = data;

    const fileExists = await FileStorage._itemFileExists({ itemId });
    if (!fileExists) {
      return false;
    }

    const fileStats = await RNFS.stat(FileStorage.itemFilePath({ itemId }));
    const itemSize = await FileStorage._getItemCheckSum({ itemId });

    return itemSize === fileStats.size;
  };

  static itemFilePath = data => {
    const { itemId } = data;

    return `${RNFS.DocumentDirectoryPath}/downloads/${itemId}`;
  };

  static deleteItem = async data => {
    const { itemId } = data;

    await FileStorage._removeItemCheckSum({ itemId });
    await RNFS.unlink(FileStorage.itemFilePath({ itemId }));
  };

  /* MARK: - Helper Services */

  static _itemFileExists = async data => {
    const { itemId } = data;

    return RNFS.exists(FileStorage.itemFilePath({ itemId }));
  };

  static _saveItemChecksum = async data => {
    const { itemId, fileLength } = data;
    const storageKey = FileStorage.FILE_CHECK_STORAGE_KEY + itemId;

    await AsyncStorage.setItem(storageKey, String(fileLength));
  };

  static _getItemCheckSum = async data => {
    const { itemId } = data;
    const storageKey = FileStorage.FILE_CHECK_STORAGE_KEY + itemId;

    const value = await AsyncStorage.getItem(storageKey);
    return Number(value);
  };

  static _removeItemCheckSum = async data => {
    const { itemId } = data;
    const storageKey = FileStorage.FILE_CHECK_STORAGE_KEY + itemId;

    await AsyncStorage.removeItem(storageKey);
  };
}
