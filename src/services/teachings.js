/**
 * @flow
 */
import moment from 'moment';
import type { Moment } from 'moment';
import { formatDate, formatTime } from 'TTB/src/lib/utils';
import type { DefaultError } from 'TTB/src/lib/connection';
import { buildRestApiClient } from 'TTB/src/lib/connection';
import type { File, Teaching } from 'TTB/src/lib/types';
import FileManager from 'TTB/src/lib/fileStorage';
import Constants from 'TTB/src/constants';
import AudioManager from './audio';

const apiClient = buildRestApiClient();

const TeachingsManager = {};

const DEFAULT_TRACK_AUTHOR = 'Thru The Bible';

const audioUrl = teachingId => {
  let url;
  if (Constants.STREAM_TEACHINGS === 'true') {
    url = `${Constants.REST_API_URL_CONTENT}/teachings/${teachingId}/binary`;
  } else {
    url = `${Constants.TEACHINGS_BASE_URL}/${teachingId}`;
  }
  return url;
};

export const buildTrack = async (teaching: Teaching): Audio => {
  const file = await TeachingsManager.getTeachingAudio(teaching);
  return {
    ...teaching,
    id: teaching.uuid,
    url: file.fileUrl,
    title: teaching.title,
    subtitle: formatDate(moment(teaching.scheduledDate).toDate()),
    artist: DEFAULT_TRACK_AUTHOR,
    pitchAlgorithm: AudioManager.trackPlayer.PITCH_ALGORITHM_VOICE,
    contentId: teaching.uuid,
    itemType: 'TEACHING_AUDIO',
    originalUrl: teaching.url,
  };
};

const buildFile = (teaching): File => {
  const fileType = teaching.mimeType ? teaching.mimeType.split('audio/').pop() : 'mp4';
  let fileName;
  if (!fileType) {
    fileName = `${teaching.uuid}.mp4`;
  } else {
    fileName = `${teaching.uuid}.${fileType}`;
  }

  const filePath = FileManager.itemFilePath({ itemId: `${fileName}` });
  return {
    ...teaching.fileField,
    fileName,
    filePath,
    fileUrl: `file:///${encodeURI(filePath)}`,
    mimeType: fileType
  };
};

export const buildTeaching = (teaching): Teaching => {
  return {
    ...teaching,
    title: teaching.displayName || teaching.name,
    date: moment(teaching.created).toDate(),
    formattedDate: moment(teaching.scheduledDate).format('dddd, MMMM D, YYYY'),
    file: buildFile(teaching),
    url: audioUrl(teaching.uuid),
    subtitle: formatTime(teaching.audioDuration),
    pitchAlgorithm: AudioManager.trackPlayer.PITCH_ALGORITHM_VOICE,
    id: teaching.uuid,
    contentId: teaching.uuid,
    duration: parseInt(teaching.audioDuration, 10),
    itemType: 'TEACHING_AUDIO',
    artist: DEFAULT_TRACK_AUTHOR,
    originalUrl: audioUrl(teaching.uuid),
  };
};

export type GetTeachingsError = 'Getting Teachings Failed' | DefaultError;
TeachingsManager.getTeachings = async (): Promise<?Array<Teaching>> => {
  try {
    const response = await apiClient.get(`${Constants.REST_API_URL_CONTENT}/teachings`);
    const { content } = response.data;
    return content.map(teaching => buildTeaching(teaching));
  } catch (e) {
    throw new Error('server-error');
  }
};

export type GetTeachingError = 'Getting Teaching Failed' | DefaultError;
TeachingsManager.getTeaching = async (teachingId: string): Promise<?Teaching> => {
  try {
    const response = await apiClient.get(
      `${Constants.REST_API_URL_CONTENT}/teachings/${teachingId}`
    );
    const { data } = response;
    return buildTeaching(data);
  } catch (e) {
    throw new Error('server-error');
  }
};

export type SearchTeachingsError = 'Search Teachings Failed' | DefaultError;
TeachingsManager.searchTeachings = async ({
  name,
  language,
  startDate,
  endDate,
  page = 0,
  pageSize = 100,
  sort = 'scheduledDate',
  bibleBook,
  bibleChapterStart,
  bibleChapterEnd
}: {
  name: ?string,
  language: string,
  startDate: ?Moment,
  endDate: ?Moment,
  page: number,
  pageSize: number,
  sort: string,
  bibleBook: ?[string],
  bibleChapterStart: string,
  bibleChapterEnd: string
}): Promise<[Teaching]> => {
  const search = {
    name,
    language,
    bibleBook,
    bibleChapterStart,
    bibleChapterEnd,
    page: {
      page: page + 1,
      perPage: pageSize,
      sort,
      sortDir: 'ASC'
    }
  };
  if (startDate || endDate) {
    search.scheduledDate = {};
    if (startDate) {
      search.scheduledDate.start = startDate.unix();
    }
    if (endDate) {
      search.scheduledDate.end = endDate.unix();
    }
  }

  try {
    const response = await apiClient.post(
      `${Constants.REST_API_URL_CONTENT}/teachings/search`,
      search
    );
    const { data } = response;
    const teachings: [Teaching] = [];
    data.content.forEach(teaching => {
      teachings.push(buildTeaching(teaching));
    });
    return teachings;
  } catch (e) {
    throw new Error('server-error');
  }
};

TeachingsManager.getDailyTeaching = async (language: string): Promise<?Teaching> => {
  try {
    const response = await apiClient.get(`${Constants.REST_API_URL_CONTENT}/teaching`, {
      params: {
        lang: language
      }
    });
    const teaching = buildTeaching(response.data);
    if (await FileManager.itemFileIsDownloaded({ itemId: `${teaching.file.fileName}` })) {
      teaching.url = teaching.file.fileUrl;
    }
    return teaching;
  } catch (e) {
    // eslint-disable-next-line no-console
    console.log(e);
    throw new Error('server-error');
  }
};

TeachingsManager.getFirstTimeTeaching = async (language: string): Promise<?Teaching> => {
  return TeachingsManager.getDailyTeaching(language);
};

TeachingsManager.getTeachingAudio = async (
  teaching: Teaching,
  cache: boolean = true
): Promise<?File> => {
  if (await FileManager.itemFileIsDownloaded({ itemId: `${teaching.file.fileName}` })) {
    return teaching.file;
  }

  if (cache) {
    FileManager.downloadItem({
      itemId: `${teaching.file.fileName}`,
      fromUrl: audioUrl(teaching.uuid)
    });
  }
  return {
    ...teaching.file,
    fileUrl: audioUrl(teaching.uuid)
  };
};

export default TeachingsManager;
