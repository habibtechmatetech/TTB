/**
 * @flow
 */

import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, View } from 'react-native';
import { useNavigation, useNavigationParam } from 'react-navigation-hooks';
import { Header } from 'TTB/src/theme/Components';
import Theme from 'TTB/src/theme/Theme';
import type { Book, Chapter, Verse, Teaching as TeachingType } from 'TTB/src/lib/types';
import EStyleSheet from 'react-native-extended-stylesheet';
import analytics from '@segment/analytics-react-native';
import Player from 'TTB/src/views/main/screens/Player';
import Teaching from './Teaching';
import { useChapter } from './Chapter.hooks';
import type { Audio } from '../../../lib/types';
import { buildTrack } from '../../../services/bible';
import AudioManager from '../../../services/audio';
import { buildTeaching } from '../../../services/teachings';

/* MARK: - Layout Styles */

const layoutStyles = EStyleSheet.create({
  scrollView: {
    marginLeft: 20,
    marginRight: 20,
    flexShrink: 1,
    flexGrow: 1,
    flexBasis: '0%'
  },
  chapter: {
    flex: 1,
    flexDirection: 'column'
  },
  verseText: {
    fontFamily: 'Noto Sans',
    fontSize: 17,
    lineHeight: 32
  }
});

/* MARK: - UI Components */

const ChapterComponent = ({ book, chapterId }: { book: Book, chapterId: number }) => {
  const chapter: Chapter = useChapter(book, chapterId);
  const [teachings, setTeachings] = useState<TeachingType>(null);
  useEffect(() => {
    if (chapter && !teachings) {
      analytics.screen('Chapter', {
        chapterId: chapter.chapterId,
        chapterTitle: chapter.chapterTitle,
        bookId: chapter.bookId,
        bookName: chapter.bookName,
        language: chapter.language,
        testament: chapter.testament
      });
      const track: Audio = buildTrack(chapter);
      if (track) {
        AudioManager.setTracks([track]);
        AudioManager.play();
      }
    }
  }, [chapter, teachings]);

  if (!chapter) {
    return <ActivityIndicator />;
  }

  return (
    <View style={{ ...layoutStyles.chapter }}>
      <ScrollView style={layoutStyles.scrollView}>
        <Text style={layoutStyles.verseText}>
          {chapter.verses.map((verse: Verse) => (
            <Text
              key={verse.verseId}
              onPress={() => verse.verseAudioStart && AudioManager.seekTo(verse.verseAudioStart)}
              onLongPress={async () => {
                let showTeachings = chapter.teachings.filter(teaching => {
                  return (
                    verse.verseId >= teaching.bibleVerseStart &&
                    verse.verseId <= teaching.bibleVerseEnd
                  );
                });
                showTeachings = showTeachings.map(buildTeaching);
                if (showTeachings && showTeachings.length > 0) {
                  await AudioManager.trackPlayer.reset();
                  setTeachings(showTeachings);
                }
              }}
            >
              {verse.verseId}. {verse.verseText.trim()} {` `}
            </Text>
          ))}
        </Text>
      </ScrollView>
      <Player startMinimized />
      {teachings && (
        <Modal animationType="slide" transparent={false} visible>
          <Teaching teachings={teachings} dismiss={() => setTeachings(null)} />
        </Modal>
      )}
    </View>
  );
};

export default () => {
  /* Hooks */
  const navigation = useNavigation();
  const book: Book = useNavigationParam('book');
  const chapterId: number = useNavigationParam('chapterId');

  /* Render */
  return (
    <View style={{ ...Theme.palette.container }}>
      {/* Header */}
      <Header
        config={{
          ui: {
            title: `${book.bookName}: ${chapterId}`,
            leftButtonImage: Theme.images.back
          },
          hooks: {
            onLeftButtonPress: () => {
              navigation.goBack();
            },
            onRightButtonPress: () => {}
          }
        }}
      />

      {/* Daily Teaching */}
      <ChapterComponent book={book} chapterId={chapterId} />
    </View>
  );
};
