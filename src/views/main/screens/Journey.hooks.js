/**
 * @flow
 */
import { useState, useEffect, useCallback } from 'react';
import type { Audio, Teaching } from 'TTB/src/lib/types';
import moment from 'moment';
import _ from 'lodash';
import { useStore } from 'TTB/src/model/root';
import TeachingsManager from '../../../services/teachings';
import BibleManager from '../../../services/bible';

type Section = {
  title: string,
  tracks: [Audio]
};

export type UseJourneyHook = {
  loading: boolean,
  sections: [Section],
  loadMore: () => Promise<void>
};

const createSection = (group: { key: [Teaching] }, addOrder: boolean = false) => {
  return Object.entries(group).map(([key, value]) => {
    return {
      title: key,
      data: addOrder ? value.map((item, index) => ({ ...item, order: index })) : value
    };
  });
};

export const useJourney = (mode: 'DATE' | 'SERIES'): UseJourneyHook => {
  const { settingsState } = useStore();
  const [page, setPage] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [sections, setSections] = useState<[Section]>([]);
  const [data, setData] = useState<[Teaching]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    const teachings = await TeachingsManager.searchTeachings({
      language: settingsState.settingsProfile.language,
      page,
      sort: mode === 'DATE' ? 'scheduledDate' : 'bibleBook'
    });
    let newData = [...data, ...teachings];
    newData = _.uniqBy(newData, e => e.uuid);
    setData(newData);
    let newSections;
    if (mode === 'DATE') {
      newSections = _.groupBy(newData, teaching => {
        return moment(teaching.scheduledDate).format('YYYY');
      });
      newSections = createSection(newSections);
      newSections = newSections.map(section => {
        const subSection = _.groupBy(section.data, teaching => {
          return moment(teaching.scheduledDate).format('MMMM YYYY');
        });
        return {
          title: section.title,
          data: createSection(subSection, true)
        };
      });
    } else {
      const bookIdMapping = {};
      const oldTestament = await BibleManager.getBooks(
        settingsState.settingsProfile.language,
        'OLD_TESTAMENT'
      );
      const newTestament = await BibleManager.getBooks(
        settingsState.settingsProfile.language,
        'NEW_TESTAMENT'
      );
      oldTestament.forEach(book => {
        bookIdMapping[book.bookId] = book.bookName;
      });
      newTestament.forEach(book => {
        bookIdMapping[book.bookId] = book.bookName;
      });
      newSections = _.groupBy(newData, teaching => {
        return bookIdMapping[teaching.bibleBook][0];
      });
      newSections = createSection(newSections);
      newSections = newSections.map(section => {
        const subSection = _.groupBy(section.data, teaching => {
          return bookIdMapping[teaching.bibleBook];
        });
        return {
          ...section,
          data: createSection(subSection, true)
        };
      });
    }
    setSections(newSections);
    setLoading(false);
  }, [mode, page, data, settingsState.settingsProfile.language]);

  useEffect(() => {
    setPage(0);
    setSections([]);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  const loadMore = async () => {
    if (!loading) {
      setPage(page + 1);
      fetchData();
    }
  };

  return {
    sections,
    loading,
    loadMore
  };
};
