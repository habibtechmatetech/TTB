import type { DefaultError } from 'TTB/src/lib/connection';
import _ from 'lodash';
import type { Book, Collection, Content, Playlist, Testament } from '../lib/types';
import BibleManager from './bible';

const buildBook = (book, language, testament): Book => {
  return {
    ...book,
    language,
    testament
  };
};

const CollectionManager = {};

export type GetBooksError = 'Getting Books Failed' | DefaultError;
CollectionManager.getCollections = async (
  language: string = 'en_US',
  testament: Testament = 'OLD_TESTAMENT'
): [Collection] => {
  try {
    const response = await BibleManager.getBooks(language, testament);
    const books = response.map(book => buildBook(book, language, testament));
    const collections = _.groupBy(books, 'bookName');
    return collections;
  } catch (e) {
    throw new Error('server-error');
  }
};

export type GetCollectionPlaylistError = 'Getting Collection Playlist Failed' | DefaultError;
CollectionManager.getPlaylist = async (collection: Collection): Playlist => {
  try {
    const items = [];
    const playlist: Playlist = {
      id: collection.collection,
      name: collection.collection,
      items
    };
    if (collection.books) {
      collection.books.forEach(book => {
        const content: Content = {
          itemType: 'BIBLE_BOOK',
          contentId: JSON.stringify({
            bookId: book.bookId,
            language: book.language,
            testament: book.testament,
            numberOfChapters: book.chapters
          })
        };
        items.push(content);
      });
    }

    return playlist;
  } catch (e) {
    throw new Error('Getting Collection Playlist Failed');
  }
};

export default CollectionManager;
