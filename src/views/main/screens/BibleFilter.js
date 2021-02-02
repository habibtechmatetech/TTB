/**
 * @flow
 */

import React, { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  ScrollView,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View
} from 'react-native';
import { TouchableButton } from 'TTB/src/theme/Components';
import { t } from 'TTB/src/services/i18n';
import Theme from 'TTB/src/theme/Theme';
import type { Book, Testament } from 'TTB/src/lib/types';
import Accordion from 'react-native-collapsible-updated/Accordion';
import EStyleSheet from 'react-native-extended-stylesheet';
import { useSafeArea } from 'react-native-safe-area-context';
import _ from 'lodash';
import { useBooks } from './Bible.hooks';

/* MARK: - Layout Styles */
const layoutStyles = EStyleSheet.create({
  scrollView: {
    marginLeft: 20,
    marginRight: 20
  },
  bible: {
    paddingVertical: '5%'
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  header: {
    height: 41,
    borderRadius: 6,
    backgroundColor: Theme.colors.uiField,
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10
  },
  headerText: {
    height: 22,
    color: Theme.colors.text,
    fontFamily: 'Noto Sans',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.87,
    lineHeight: 22
  },
  activeHeader: {
    height: 40,
    borderRadius: 6,
    backgroundColor: '#063D62',
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10
  },
  activeHeaderText: {
    height: 22,
    color: Theme.colors.listItem,
    fontFamily: 'Noto Sans',
    fontSize: 16,
    fontWeight: '400',
    letterSpacing: 0.87,
    lineHeight: 22
  },
  title: {},
  chapterButton: {
    margin: 5,
    padding: 5,
    width: 42,
    height: 42,
    alignContent: 'center',
    justifyContent: 'center',
    borderRadius: 21
  },
  chapterText: {
    color: Theme.colors.text,
    fontFamily: 'Noto Sans',
    fontSize: 14,
    letterSpacing: 0.76,
    lineHeight: 19,
    textAlign: 'center'
  },
  buttonSelectedText: {
    flex: 1,
    color: 'white',
    fontFamily: 'Noto Sans',
    fontSize: 11,
    letterSpacing: 0.76,
    lineHeight: 19,
    textAlign: 'center',
    marginHorizontal: 5
  },
  buttonUnselectedText: {
    flex: 1,
    color: Theme.colors.text,
    fontFamily: 'Noto Sans',
    fontSize: 11,
    letterSpacing: 0.76,
    lineHeight: 19,
    textAlign: 'center',
    marginHorizontal: 5
  },
  testamentButton: {
    padding: 5,
    alignItems: 'center',
    borderRadius: 20,
    flex: 1
  },
  testamentButtonInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  testamentCount: {
    backgroundColor: '#161B25',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    width: 24,
    height: 22
  },
  testamentCountText: {
    fontFamily: 'NotoSans-SemiBold',
    fontSize: 8,
    color: '#FFFFFF',
    textAlign: 'center',
    justifyContent: 'center',
    alignItems: 'center'
  }
});

/* MARK: - UI Components */
const _renderSectionTitle = section => {
  return (
    <View style={layoutStyles.content}>
      <Text>{section.content}</Text>
    </View>
  );
};

const _renderHeader = (content, section, isActive) => {
  if (isActive) {
    return (
      <View style={layoutStyles.activeHeader}>
        <Text style={layoutStyles.activeHeaderText}>{content.bookName}</Text>
        <Image source={Theme.images.downWhite} />
      </View>
    );
  }

  return (
    <View style={layoutStyles.header}>
      <Text style={layoutStyles.headerText}>{content.bookName}</Text>
      <Image source={Theme.images.right} />
    </View>
  );
};

export default ({
  open,
  onClose
}: {
  open: boolean,
  onClose: () => Array<{ bookId: string, bibleChapterStart: number, bibleChapterEnd: number }>
}) => {
  const [activeSections, setActiveSections] = useState([]);
  const [testament, setTestament] = useState<Testament>('OLD_TESTAMENT');
  const [oldTestamentSelection, setOldTestamentSelection] = useState({});
  const [newTestamentSelection, setNewTestamentSelection] = useState({});
  const { books, loading } = useBooks(testament);
  const insets = useSafeArea();

  const close = () => {
    const selection = [];
    Object.entries({ ...oldTestamentSelection, ...newTestamentSelection }).forEach(
      ([key, [start, end]]) => {
        selection.push({ bookId: key, bibleChapterStart: start, bibleChapterEnd: end });
      }
    );
    onClose(selection);
  };

  const _renderContent = (section: Book, index: number, isActive: boolean) => {
    if (!isActive) {
      return <></>;
    }
    return (
      <View style={layoutStyles.content}>
        {section.chapters.map(chapter => {
          const selectedTestament =
            testament === 'OLD_TESTAMENT' ? oldTestamentSelection : newTestamentSelection;
          const [start, end] = selectedTestament[section.bookId] || [-1, -1];
          return (
            <TouchableButton
              onPress={() => {
                const selection = { ...selectedTestament };
                let [startValue, endValue] = [start, end];
                if (startValue !== -1 && startValue === endValue && startValue === chapter) {
                  delete selection[section.bookId];
                } else {
                  if (startValue === -1 || startValue !== endValue) {
                    startValue = chapter;
                    endValue = chapter;
                  } else {
                    startValue = Math.min(chapter, startValue, endValue);
                    endValue = Math.max(chapter, startValue, endValue);
                  }
                  selection[section.bookId] = [startValue, endValue];
                }
                if (testament === 'OLD_TESTAMENT') {
                  setOldTestamentSelection(selection);
                } else {
                  setNewTestamentSelection(selection);
                }
              }}
              style={layoutStyles.chapterButton}
              underlayColor={Theme.colors.calendar.highlight}
              key={`${section.bookName}-${chapter}`}
              selected={_.inRange(chapter, start, end + 1)}
            >
              <Text style={layoutStyles.chapterText}> {`${chapter}`}</Text>
            </TouchableButton>
          );
        })}
      </View>
    );
  };

  return (
    <Modal animationType="slide" transparent onRequestClose={close} visible={open}>
      <View
        style={{
          flex: 1,
          backgroundColor: Theme.colors.modal.background,
          flexDirection: 'column-reverse'
        }}
      >
        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'stretch',
              display: 'flex',
              width: '100%',
              alignSelf: 'flex-end',
              backgroundColor: Theme.colors.player.background,
              borderRadius: 30,
              maxHeight: '90%'
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                marginLeft: 20,
                marginRight: 64,
                marginVertical: 13,
                alignItems: 'center'
              }}
            >
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'stretch'
                }}
              >
                <TouchableButton
                  onPress={async () => {
                    setTestament('OLD_TESTAMENT');
                  }}
                  style={
                    testament === 'OLD_TESTAMENT'
                      ? { ...layoutStyles.testamentButton }
                      : {
                          ...layoutStyles.testamentButton,
                          borderColor: Theme.colors.text,
                          borderWidth: 1
                        }
                  }
                  buttonStyle={{ ...layoutStyles.testamentButtonInner }}
                  underlayColor={Theme.colors.buttonHighlight}
                  color={testament === 'OLD_TESTAMENT' ? Theme.colors.button : 'transparent'}
                  key="Old Testament"
                >
                  <View style={{ ...layoutStyles.testamentCount }}>
                    <Text style={{ ...layoutStyles.testamentCountText }}>
                      {Object.values(oldTestamentSelection).reduce(
                        (r, v) => r + Math.max(v[1] - v[0] + 1, 0),
                        0
                      )}
                    </Text>
                  </View>
                  <Text
                    style={
                      testament === 'OLD_TESTAMENT'
                        ? layoutStyles.buttonSelectedText
                        : layoutStyles.buttonUnselectedText
                    }
                  >
                    {t('bible.oldTestament')}
                  </Text>
                </TouchableButton>
                <TouchableButton
                  onPress={async () => {
                    setTestament('NEW_TESTAMENT');
                  }}
                  style={
                    testament === 'NEW_TESTAMENT'
                      ? { ...layoutStyles.testamentButton, marginLeft: 8 }
                      : {
                          ...layoutStyles.testamentButton,
                          marginLeft: 8,
                          borderColor: Theme.colors.text,
                          borderWidth: 1
                        }
                  }
                  buttonStyle={{ ...layoutStyles.testamentButtonInner }}
                  underlayColor={Theme.colors.buttonHighlight}
                  color={testament === 'NEW_TESTAMENT' ? Theme.colors.button : 'transparent'}
                  key="New Testament"
                >
                  <View style={{ ...layoutStyles.testamentCount }}>
                    <Text style={{ ...layoutStyles.testamentCountText }}>
                      {Object.values(newTestamentSelection).reduce(
                        (r, v) => r + Math.max(v[1] - v[0] + 1, 0),
                        0
                      )}
                    </Text>
                  </View>
                  <Text
                    style={
                      testament === 'NEW_TESTAMENT'
                        ? layoutStyles.buttonSelectedText
                        : layoutStyles.buttonUnselectedText
                    }
                  >
                    {t('bible.newTestament')}
                  </Text>
                </TouchableButton>
              </View>
              <TouchableOpacity style={{ marginHorizontal: 24 }} onPress={close}>
                <Image source={Theme.images.closeX} />
              </TouchableOpacity>
            </View>

            <View
              style={{
                flexDirection: 'column',
                justifyContent: 'space-between',
                alignItems: 'stretch'
              }}
            >
              <ScrollView
                style={layoutStyles.scrollView}
                contentContainerStyle={{ paddingBottom: insets.bottom + 80 }}
              >
                {loading === true ? (
                  <ActivityIndicator />
                ) : (
                  <Accordion
                    sections={books}
                    renderSectionTitle={_renderSectionTitle}
                    renderHeader={_renderHeader}
                    renderContent={_renderContent}
                    onChange={section => {
                      setActiveSections(section);
                    }}
                    touchableComponent={TouchableHighlight}
                    activeSections={activeSections}
                    underlayColor="transparent"
                  />
                )}
              </ScrollView>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};
