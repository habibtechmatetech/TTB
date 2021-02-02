/**
 * @flow
 */

export type Testament = 'OLD_TESTAMENT' | 'NEW_TESTAMENT';
export type ContentType = 'TEACHING_AUDIO' | 'BIBLE_AUDIO' | 'BIBLE_BOOK';

export type Collection = {|
  collection: string,
  book: Book
|};

export type Book = {|
  bookId: string,
  bookName: string,
  bookOrder: string,
  numberOfChapters: number,
  chapters: Array<number>,
  language: string,
  testament: Testament
|};

export type Chapter = {|
  chapterId: number,
  chapterTitle: string,
  verses: Array<Verse>
|};

export type Verse = {|
  verseId: string,
  verseText: string,
  paragraphNumber: number,
  verseAudioStart: number
|};

export type Audio = {|
  id: string,
  url: string,
  title: string,
  subtitle?: string,
  artist: string,
  itemType: ContentType,
  contentId: string,
  itemId?: string
|};

export type File = {|
  fileName: string,
  fileSize: number,
  mimeType: string
|};

export type Teaching = {|
  uuid: string,
  title: string,
  date: Date,
  formattedDate: string,
  file: File
|};

export type Content = {|
  id: string,
  itemType: ContentType,
  contentId: string
|};

export type Playlist = {|
  id: string,
  name: string,
  order: number,
  items: Array<Content>
|};

export type Device = {|
  deviceAddress: string,
  deviceName: string,
  status: number,
  isGroupOwner: boolean
|};

export type Group = {|
  name: string
|};
