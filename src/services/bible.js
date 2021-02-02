/**
 * @flow
 */

import type { Book, Chapter, Testament } from 'TTB/src/lib/types';
import type { DefaultError } from 'TTB/src/lib/connection';
import { buildRestApiClient } from 'TTB/src/lib/connection';
import Constants from 'TTB/src/constants';
import type { Audio } from '../lib/types';
import { formatTime } from '../lib/utils';
import AudioManager from './audio';

const apiClient = buildRestApiClient();

const BibleManager = {};

const DEFAULT_TRACK_AUTHOR = 'Thru The Bible';

const buildBook = (book, language, testament): Book => {
  return {
    ...book,
    language,
    testament
  };
};

const buildChapter = (chapter): Chapter => {
  return {
    ...chapter
  };
};

export const buildTrack = (chapter: Chapter): Audio => {
  return {
    id: `${chapter.bookId}.${chapter.chapterId}`,
    url:
      chapter.audioContents && chapter.audioContents.length > 0
        ? chapter.audioContents[0].path
        : undefined,
    title: `${chapter.bookName}: ${chapter.chapterTitle}`,
    artist: DEFAULT_TRACK_AUTHOR,
    subtitle:
      chapter.audioContents && chapter.audioContents.length > 0
        ? formatTime(chapter.audioContents[0].length)
        : 'N/A',
    itemType: 'BIBLE_AUDIO',
    pitchAlgorithm: AudioManager.trackPlayer.PITCH_ALGORITHM_VOICE,
    contentId: JSON.stringify({
      language: chapter.language,
      testament: chapter.testament,
      bookId: chapter.bookId,
      bookName: chapter.bookName,
      chapterId: chapter.chapterId,
      itemType: 'BIBLE_AUDIO'
    }),
    originalUrl: chapter.audioContents && chapter.audioContents.length > 0
    ? chapter.audioContents[0].path
    : undefined,
  };
};

const booksCache = {};
export type GetBooksError = 'Getting Books Failed' | DefaultError;
BibleManager.getBooks = async (
  language: string = 'en_US',
  testament: Testament = 'OLD_TESTAMENT'
) => {
  if (booksCache[`${language}_${testament}`]) {
    return booksCache[`${language}_${testament}`];
  }
  try {
    const response = await apiClient.get(
      `${Constants.REST_API_URL_CONTENT}/book/${language}/${testament}`
    );
    const content = response.data;
    const books = content.map(book => buildBook(book, language, testament));
    booksCache[`${language}_${testament}`] = books;
    return books;
  } catch (e) {
    throw new Error('server-error');
  }
};

BibleManager.getTestament = async (language: string = 'en_US', bookId: string) => {
  const oldTestament = await BibleManager.getBooks(language, 'OLD_TESTAMENT');
  return oldTestament.some(book => bookId === book.bookId) ? 'OLD_TESTAMENT' : 'NEW_TESTAMENT';
};

export type GetChapterError = 'Getting Chapter Failed' | DefaultError;
BibleManager.getChapter = async (book: Book, chapterId: number) => {
  try {
    const response = await apiClient.get(
      `${Constants.REST_API_URL_CONTENT}/chapter/${book.language}/${book.testament}/${book.bookId}/${chapterId}`
    );
    const content = response.data;
    return buildChapter({
      ...content,
      chapterId,
      testament: book.testament,
      language: book.language
    });
  } catch (e) {
    throw new Error('server-error');
  }
};

export default BibleManager;
