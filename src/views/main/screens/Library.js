/**
 * @flow
 */

import React from 'react';
import { Dimensions, Image, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from 'react-navigation-hooks';
import { Header } from 'TTB/src/theme/Components';
import { t } from 'TTB/src/services/i18n';
import Theme from 'TTB/src/theme/Theme';
import EStyleSheet from 'react-native-extended-stylesheet';
import { TabBarProps, TabView } from 'react-native-tab-view';
import Playlists from 'TTB/src/views/main/screens/Playlists';
import Downloads from 'TTB/src/views/main/screens/Downloads';
import Favorites from 'TTB/src/views/main/screens/Favorites';

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
  }
});

const LibraryTabBar = (props: TabBarProps) => {
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

export default () => {
  /* Hooks */
  const navigation = useNavigation();
  const [index, setIndex] = React.useState(0);
  const [routes] = React.useState([
    { key: 'favorites', title: t('library.tabs.favorites') },
    { key: 'playlists', title: t('library.tabs.playlists') },
    { key: 'downloads', title: t('library.tabs.downloads') }
  ]);

  const renderScene = ({ route }: any) => {
    const currentTab = routes[index].key;
    switch (route.key) {
      case 'favorites':
        return <Favorites currentTab={currentTab} />;
      case 'playlists':
        return <Playlists currentTab={currentTab} />;
      case 'downloads':
        return <Downloads currentTab={currentTab} />;
      default:
        return null;
    }
  };

  /* Render */
  return (
    <View style={{ ...Theme.palette.container }}>
      {/* Header */}
      <Header
        config={{
          ui: {
            title: t('library.header'),
            leftButtonImage: Theme.images.menu.hamburger
          },
          hooks: {
            onLeftButtonPress: navigation.toggleDrawer
          }
        }}
      />

      {/* Tabs */}
      <View style={{ ...styles.tabs }}>
        <TabView
          swipeEnabled={false}
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={initialLayout}
          renderTabBar={LibraryTabBar}
        />
      </View>
    </View>
  );
};
