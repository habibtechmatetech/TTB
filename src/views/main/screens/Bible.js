/**
 * @flow
 */

import React, { useState, useCallback } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableHighlight, View } from 'react-native';
import { useNavigation, useFocusEffect } from 'react-navigation-hooks';
import { Header, TouchableButton } from 'TTB/src/theme/Components';
import { t } from 'TTB/src/services/i18n';
import Theme from 'TTB/src/theme/Theme';
import type { Book, Testament } from 'TTB/src/lib/types';
import Accordion from 'react-native-collapsible-updated/Accordion';
import EStyleSheet from 'react-native-extended-stylesheet';
import analytics from '@segment/analytics-react-native';
import { useSafeArea } from 'react-native-safe-area-context';
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
    color: 'white',
    fontFamily: 'Noto Sans',
    fontSize: 13,
    letterSpacing: 0.76,
    lineHeight: 19,
    textAlign: 'center',
    marginHorizontal: 5
  },
  buttonUnselectedText: {
    color: Theme.colors.text,
    fontFamily: 'Noto Sans',
    fontSize: 13,
    letterSpacing: 0.76,
    lineHeight: 19,
    textAlign: 'center',
    marginHorizontal: 5
  },
  testamentButton: {
    margin: 5,
    marginBottom: 20,
    padding: 5,
    height: 30,
    alignItems: 'center',
    borderRadius: 20
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

const Bible = () => {
  const [activeSections, setActiveSections] = useState([]);
  const [testament, setTestament] = useState<Testament>('OLD_TESTAMENT');
  const { books, loading } = useBooks(testament);
  const { navigate } = useNavigation();
  const insets = useSafeArea();

  const _renderContent = (section: Book, index: number, isActive: boolean) => {
    if (!isActive) {
      return <></>;
    }
    return (
      <View style={layoutStyles.content}>
        {section.chapters.map(chapter => {
          return (
            <TouchableButton
              onPress={() => {
                // navigate to the chapter
                navigate('Chapter', { book: section, chapterId: chapter });
              }}
              style={layoutStyles.chapterButton}
              underlayColor={Theme.colors.calendar.highlight}
              key={`${section.bookName}-${chapter}`}
            >
              <Text style={layoutStyles.chapterText}> {`${chapter}`}</Text>
            </TouchableButton>
          );
        })}
      </View>
    );
  };

  return (
    <View
      style={{ flexDirection: 'column', justifyContent: 'space-between', alignItems: 'stretch' }}
    >
      <View style={{ flexDirection: 'row' }}>
        <TouchableButton
          onPress={async () => {
            setTestament('OLD_TESTAMENT');
          }}
          style={
            testament === 'OLD_TESTAMENT'
              ? { ...layoutStyles.testamentButton, marginLeft: 21 }
              : {
                  ...layoutStyles.testamentButton,
                  marginLeft: 21,
                  borderColor: Theme.colors.text,
                  borderWidth: 1
                }
          }
          underlayColor={Theme.colors.buttonHighlight}
          color={testament === 'OLD_TESTAMENT' ? Theme.colors.button : 'transparent'}
          key="Old Testament"
        >
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
          underlayColor={Theme.colors.buttonHighlight}
          color={testament === 'NEW_TESTAMENT' ? Theme.colors.button : 'transparent'}
          key="New Testament"
        >
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
      <ScrollView
        style={layoutStyles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 180 }}
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
  );
};

export default () => {
  /* Hooks */
  const navigation = useNavigation();
  useFocusEffect(
    useCallback(() => {
      analytics.screen('Bible');
    }, [])
  );

  /* Render */
  return (
    <View style={{ ...Theme.palette.container }}>
      {/* Header */}
      <Header
        config={{
          ui: {
            title: t('bible.header'),
            leftButtonImage: Theme.images.menu.hamburger,
            rightButtonImage: Theme.images.search
          },
          hooks: {
            onLeftButtonPress: navigation.toggleDrawer,
            onRightButtonPress: () => navigation.navigate('Search')
          }
        }}
      />

      {/* Daily Teaching */}
      <View style={{ ...layoutStyles.bible }}>
        <Bible />
      </View>
    </View>
  );
};
