/**
 * @flow
 */
import type { Testament, Book } from 'TTB/src/lib/types';
import { useEffect, useState } from 'react';
import BibleManager from 'TTB/src/services/bible';
import { useStore } from 'TTB/src/model/root';

export function useBooks(testament: Testament = 'OLD_TESTAMENT'): ?[Book] {
  const { settingsState } = useStore();
  const [books, setBooks] = useState<?[Book]>(null);
  const [loading, setLoading] = useState<boolean>(true);
  useEffect(() => {
    async function _init() {
      setLoading(true);
      const newBooks = await BibleManager.getBooks(
        settingsState.settingsProfile.language,
        testament
      );
      setBooks(newBooks);
      setLoading(false);
    }

    _init();
  }, [testament, settingsState.settingsProfile.language]);

  return { books, loading };
}
