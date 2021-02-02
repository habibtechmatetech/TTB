/**
 * @flow
 */
import type { Chapter, Teaching, Audio } from 'TTB/src/lib/types';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import { useStore } from 'TTB/src/model/root';
import TeachingsManager from '../../../services/teachings';
import BibleManager, { buildTrack } from '../../../services/bible';

export const useSearch = (
  text: string,
  filters: Array<{ bookId: string, bibleChapterStart: number, bibleChapterEnd: number }>
): { loading: boolean, teachings: ?[Teaching], chapters: ?[Audio] } => {
  const { settingsState } = useStore();
  const [teachings, setTeachings] = useState<?[Teaching]>(null);
  const [chapters, setChapters] = useState<?[Audio]>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function _init() {
      setLoading(true);
      const getChapters: [Promise] = [];
      const getTeachings: [Promise] = [];
      if (filters && filters.length) {
        filters.forEach(filter => {
          getTeachings.push(
            TeachingsManager.searchTeachings({
              name: text,
              language: settingsState.settingsProfile.language,
              pageSize: 10,
              bibleBook: [filter.bookId],
              bibleChapterStart: filter.bibleChapterStart,
              bibleChapterEnd: filter.bibleChapterEnd
            })
          );
        });
      } else {
        getTeachings.push(
          TeachingsManager.searchTeachings({
            name: text,
            language: settingsState.settingsProfile.language,
            pageSize: 10
          })
        );
      }
      let newTeachings = [];
      try {
        const response: [[Teaching]] = await Promise.all(getTeachings);
        newTeachings = response.reduce((acc, value) => [...acc, ...value], []);
        newTeachings = _.uniqBy(newTeachings, teaching => teaching.uuid);
        newTeachings = newTeachings.map((teaching, index) => {
          return { ...teaching, order: index };
        });
        setTeachings(newTeachings);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }

      // eslint-disable-next-line no-restricted-syntax
      for (const teaching of newTeachings) {
        if (getChapters.length > 10) {
          break;
        }

        // get book from teaching
        const bookId = teaching.bibleBook;
        const { language } = teaching;
        // eslint-disable-next-line no-await-in-loop
        const testament = await BibleManager.getTestament(language, bookId);

        for (
          let i = 0;
          i <
          Math.min(teaching.bibleChapterEnd - teaching.bibleChapterStart, 10 - getChapters.length);
          i += 1
        ) {
          getChapters.push(
            BibleManager.getChapter({ language, testament, bookId }, i + teaching.bibleChapterStart)
          );
        }
      }

      try {
        const newChapters: [Chapter] = await Promise.all(getChapters);
        let tracks: [Audio] = newChapters.map(chapter => buildTrack(chapter));
        tracks = _.uniqBy(tracks, track => track.contentId);
        tracks = tracks.map((track, index) => {
          return { ...track, order: index };
        });
        setChapters(tracks);
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log(e);
      }

      setLoading(false);
    }
    if (text || (filters && filters.length > 0)) {
      _init();
    }
  }, [text, filters, settingsState.settingsProfile.language]);

  return { loading, teachings, chapters };
};
