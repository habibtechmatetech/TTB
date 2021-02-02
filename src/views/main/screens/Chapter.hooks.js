/**
 * @flow
 */
import type { Book, Chapter } from 'TTB/src/lib/types';
import { useEffect, useState } from 'react';
import BibleManager from 'TTB/src/services/bible';

export function useChapter(book: Book, chapterId: number): ?Chapter {
  const [chapter, setChapter] = useState<?Chapter>(null);
  useEffect(() => {
    async function _init() {
      const newChapter = await BibleManager.getChapter(book, chapterId);
      setChapter(newChapter);
    }

    _init();
  }, [book, chapterId]);

  /* Helper Functions */

  return chapter;
}
