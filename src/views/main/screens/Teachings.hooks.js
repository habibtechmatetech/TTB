/**
 * @flow
 */

import { useEffect, useState } from 'react';

import TeachingsManager from 'TTB/src/services/teachings';
import CollectionManager from 'TTB/src/services/collections';
import type { Book, Teaching, Testament } from 'TTB/src/lib/types';
import _ from 'lodash';
import { useStore } from 'TTB/src/model/root';

export function useDailyTeaching(): ?Teaching {
  /* State */
  const { settingsState } = useStore();
  const [dailyTeaching, setDailyTeaching] = useState<?Teaching>(null);

  /* Effects */
  useEffect(_init, []);

  /* Helper Functions */
  function _init() {
    TeachingsManager.getDailyTeaching(settingsState.settingsProfile.language).then(teaching =>
      setDailyTeaching(teaching)
    );
  }

  return dailyTeaching;
}

export function useCollection(testament: Testament): [Book] {
  const { settingsState } = useStore();
  const [collection, setCollection] = useState([]);
  /* Effects */
  useEffect(_init, []);

  /* Helper Functions */
  function _init() {
    CollectionManager.getCollections(settingsState.settingsProfile.language, testament).then(
      newCollection => {
        const pages = _.chunk(
          Object.keys(newCollection).map(key => {
            return {
              collection: key,
              book: newCollection[key][0]
            };
          }),
          4
        );
        setCollection(pages);
      }
    );
  }

  return collection;
}
