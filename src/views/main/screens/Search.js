/**
 * @flow
 */
import React, { useState } from 'react';
import { Dimensions, Modal, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import { Input } from 'TTB/src/theme/Components';
import Theme from 'TTB/src/theme/Theme';
import EStyleSheet from 'react-native-extended-stylesheet';
import { TabBarProps, TabView } from 'react-native-tab-view';
import BibleList from 'TTB/src/views/main/screens/BibleFilter';
import { useSafeArea } from 'react-native-safe-area-context';
import { t } from 'TTB/src/services/i18n';
import { useSearch } from './Search.hooks';
import MediaList from '../../../theme/Components.mediaList';
import Teaching from './Teaching';

/* MARK: - Layout Styles */

const styles = EStyleSheet.create({
  scrollView: {
    marginLeft: 20,
    marginRight: 20
  },
  tabBar: {
    backgroundColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 20,
    marginRight: 20
  },
  tabBarIndicator: {
    backgroundColor: Theme.colors.tab.indicator
  },
  tabs: {
    flex: 1,
    marginTop: 10
  },
  tabItem: {
    paddingBottom: 5,
    alignItems: 'center',
    justifyContent: 'center',
    display: 'flex'
  },
  activeTabItem: {
    borderStyle: 'solid',
    borderBottomWidth: 2,
    borderBottomColor: Theme.colors.tab.indicator
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    alignItems: 'center'
  },
  verticalContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'flex-start'
    //  backgroundColor: colors.background,
    //  paddingHorizontal: '10%'
  },
  ContainerStyle: {
    paddingTop: '15rem',
    flexDirection: 'row-reverse'
  },
  searchStyle: {
    marginLeft: 40,
    marginRight: 40
  },
  fieldsContainer: {
    justifyContent: 'space-around',
    flex: 100
  }
});

const searchStyles = EStyleSheet.create({
  container: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch'
  },
  searchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 15
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: 15,
    marginTop: 0
  },
  searchBar: {
    flex: 1
  },
  cancelButton: {
    marginLeft: 15
  },
  cancelButtonText: {
    opacity: 0.5,
    fontFamily: 'NotoSans-Bold',
    fontSize: 10,
    color: '#2A324B',
    letterSpacing: 0.52,
    textAlign: 'center'
  },
  filterButton: {
    borderWidth: 2,
    borderColor: '#161B25',
    borderRadius: 19
  },
  filterButtonText: {
    fontFamily: 'NotoSans-SemiBold',
    fontSize: 13,
    color: '#2A324B',
    textAlign: 'center',
    lineHeight: 22,
    paddingVertical: 4,
    paddingHorizontal: 16
  },
  searchResults: {
    fontFamily: 'NotoSans-Regular',
    fontSize: 11,
    color: '#2A324B',
    lineHeight: 25
  }
});

const SearchTabBar = (props: TabBarProps) => {
  const { navigationState } = props;
  return (
    <View style={styles.tabBar}>
      {navigationState.routes.map((route, i) => {
        const focused = i === props.navigationState.index;
        const key = `Tab-Button-${i}`;
        return (
          <TouchableOpacity
            key={key}
            style={styles.tabText}
            onPress={() => props.jumpTo(route.key)}
          >
            <View
              style={{
                marginRight: i < props.navigationState.routes.length - 1 ? 12 : 0,
                marginLeft: i > 0 ? 12 : 0,
                ...styles.tabItem,
                ...(focused ? styles.activeTabItem : styles.tabItem)
              }}
            >
              <Text
                style={{
                  ...(focused
                    ? {
                        ...Theme.palette.h1,
                        color: Theme.colors.tab.highlight
                      }
                    : {
                        ...Theme.palette.h7,
                        color: '#161B25'
                      })
                }}
              >
                {route.title}
              </Text>
            </View>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

/* MARK: - UI Components */
const initialLayout = { width: Dimensions.get('window').width };

export default ({ navigation: { goBack } }: { navigation: any }) => {
  /* Hooks */
  const { navigate } = useNavigation();
  const insets = useSafeArea();
  const [showFilter, setShowFilter] = useState(false);
  const [tabIndex, setTabIndex] = useState(0);
  const [searchText, setSearchText] = useState<string>('');
  const [selectedTeaching, setSelectedTeaching] = useState(null);
  const [filter, setFilter] = useState<
    Array<{ bookId: string, bibleChapterStart: number, bibleChapterEnd: number }>
  >([]);
  const [routes] = useState([
    { key: 'teachings', title: t('search.teachings.title') },
    { key: 'bible', title: t('search.bible.title') }
  ]);
  const { loading, teachings, chapters } = useSearch(searchText, filter);

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'teachings':
        return (
          <MediaList
            data={teachings}
            onSelectItem={item => {
              setSelectedTeaching(item);
            }}
            refreshing={loading}
          />
        );
      case 'bible':
        return (
          <MediaList
            data={chapters}
            onSelectItem={item => {
              const chapter = JSON.parse(item.contentId);
              navigate('Chapter', {
                book: {
                  bookName: chapter.bookName,
                  bookId: chapter.bookId,
                  testament: chapter.testament,
                  language: chapter.language
                },
                chapterId: chapter.chapterId
              });
            }}
            refreshing={loading}
          />
        );
      default:
        return null;
    }
  };

  /* Render */
  return (
    <View style={{ ...Theme.palette.container, paddingTop: insets.top }}>
      {/* Fields */}
      <View style={{ ...searchStyles.searchContainer }}>
        <View style={{ ...searchStyles.searchBar }}>
          <Input
            placeholder={t('search.searchBoxPlaceHolder')}
            autoCapitalize="none"
            onSubmitEditing={({ nativeEvent: { text } }) => {
              setSearchText(text);
            }}
          />
        </View>

        <TouchableOpacity style={{ ...searchStyles.cancelButton }} onPress={() => goBack()}>
          <Text style={{ ...searchStyles.cancelButtonText }}>{t('search.cancelButton')}</Text>
        </TouchableOpacity>
      </View>
      <View style={{ ...searchStyles.filterContainer }}>
        {teachings || chapters ? (
          <Text style={{ ...searchStyles.searchResults }}>
            {tabIndex === 0 && teachings && teachings.length}
            {tabIndex === 1 && chapters && chapters.length}
            {!(chapters || teachings) && loading && t('uiControls.loading')}{' '}
            {t('search.searchResults')}
          </Text>
        ) : (
          <View />
        )}
        <TouchableOpacity
          style={{ ...searchStyles.filterButton }}
          onPress={() => setShowFilter(true)}
        >
          <Text style={{ ...searchStyles.filterButtonText }}>{t('search.filterButton')}</Text>
        </TouchableOpacity>
      </View>
      {/* Tabs */}
      <View style={{ ...styles.tabs }}>
        <TabView
          swipeEnabled={false}
          navigationState={{ index: tabIndex, routes }}
          renderScene={renderScene}
          onIndexChange={setTabIndex}
          initialLayout={initialLayout}
          renderTabBar={SearchTabBar}
        />
      </View>
      <BibleList
        open={showFilter}
        onClose={newFilter => {
          setFilter(newFilter);
          setShowFilter(false);
        }}
      />
      <Modal animationType="slide" transparent={false} visible={!!selectedTeaching}>
        <Teaching teachings={[selectedTeaching]} dismiss={() => setSelectedTeaching(null)} />
      </Modal>
    </View>
  );
};
