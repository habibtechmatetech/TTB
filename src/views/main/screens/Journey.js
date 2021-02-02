/**
 * @flow
 */

import React, { useCallback, useEffect, useState } from 'react';
import Theme from 'TTB/src/theme/Theme';
import { Header, TouchableButton } from 'TTB/src/theme/Components';
import { t } from 'TTB/src/services/i18n';
import EStyleSheet from 'react-native-extended-stylesheet';
import Player from 'TTB/src/views/main/screens/Player';
import { Image, Text, View, SectionList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from 'react-navigation-hooks';
import analytics from '@segment/analytics-react-native';
import Collapsible from 'react-native-collapsible-updated';
import { Observer } from 'mobx-react';
import { useJourney } from './Journey.hooks';
import MediaList from '../../../theme/Components.mediaList';
import AudioManager from '../../../services/audio';
import { Option, OptionsModal, ShareModal, DownloadModal } from '../../../theme/Components.modal';
import AddToPlaylist from './AddToPlaylist';
import { useStore } from '../../../model/root';
import { useDownload } from './Downloads.hooks';

/* MARK: - Layout Styles */
const layoutStyles = EStyleSheet.create({
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
  modeButton: {
    margin: 5,
    marginBottom: 10,
    padding: 5,
    height: 30,
    width: 115,
    alignItems: 'center',
    borderRadius: 20
  },
  sectionHeader: {
    marginHorizontal: 30,
    backgroundColor: Theme.colors.background,
    flexDirection: 'row'
  },
  sectionHeaderText: {
    fontFamily: 'NotoSans-Regular',
    fontSize: 22,
    color: Theme.colors.text,
    letterSpacing: 0,
    lineHeight: 24
  },
  subSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 30,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 10
    },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 5,
    paddingHorizontal: 20,
    paddingVertical: 12
  },
  subSectionHeaderContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start'
  },
  subSectionHeaderTitle: {
    fontFamily: 'Noto Sans',
    fontSize: 16,
    color: '#2A324B',
    letterSpacing: 0.1
  },
  subSectionHeaderSubtitle: {
    fontFamily: 'Noto Sans',
    fontSize: 12,
    color: '#2A324B',
    letterSpacing: 0,
    opacity: 0.6
  },
  subSection: {
    marginTop: 8,
    zIndex: 2
  }
});

const ModeButton = ({
  selected,
  label,
  onPress,
  style
}: {
  selected: boolean,
  label: string,
  onPress: any,
  style: any
}) => {
  return (
    <TouchableButton
      onPress={onPress}
      style={{
        ...style,
        ...layoutStyles.modeButton,
        ...(selected
          ? { ...{} }
          : {
              borderColor: Theme.colors.text,
              borderWidth: 1
            })
      }}
      underlayColor={Theme.colors.buttonHighlight}
      color={selected ? Theme.colors.button : 'transparent'}
    >
      <Text style={selected ? layoutStyles.buttonSelectedText : layoutStyles.buttonUnselectedText}>
        {label}
      </Text>
    </TouchableButton>
  );
};

const DisplayMode = ({ mode, setMode }: { mode: 'DATE' | 'SERIES', setMode: string => void }) => {
  return (
    <View
      style={{
        backgroundColor: 'transparent',
        marginHorizontal: 30,
        marginVertical: 30,
        flexDirection: 'row'
      }}
    >
      <ModeButton
        selected={mode === 'DATE'}
        label={t('journey.byDate')}
        onPress={() => setMode('DATE')}
        style={{ marginRight: 4 }}
      />
      <ModeButton
        style={{ marginLeft: 4 }}
        selected={mode === 'SERIES'}
        label={t('journey.bySeries')}
        onPress={() => setMode('SERIES')}
      />
    </View>
  );
};

const SectionHeader = ({ title }: { title: string }) => {
  return (
    <View style={layoutStyles.sectionHeader}>
      <Text style={layoutStyles.sectionHeaderText}>{title}</Text>
    </View>
  );
};

const SubSectionHeader = ({
  title,
  size,
  isActive
}: {
  title: string,
  size: number,
  isActive: boolean
}) => {
  return (
    <View style={layoutStyles.subSectionHeader}>
      <View style={layoutStyles.subSectionHeaderContainer}>
        <Text style={layoutStyles.subSectionHeaderTitle}>{title}</Text>
        <Text style={layoutStyles.subSectionHeaderSubtitle}>
          {size} {t('journey.sections.tracksLabel')}
        </Text>
      </View>
      <Image source={isActive ? Theme.images.down : Theme.images.right} />
    </View>
  );
};

export default () => {
  /* Hooks */
  const { favoritesState } = useStore();
  const [activeSection, setActiveSection] = useState<string>(0);
  const [activeIndex, setActiveIndex] = useState<string>(0);
  const [mode, setMode] = useState<'DATE' | 'SERIES'>('DATE');
  const { goBack } = useNavigation();
  const { loading, sections, loadMore } = useJourney(mode);
  const [showMediaItemOptions, setShowMediaItemOptions] = useState<Audio>(null);
  const [showAddToPlaylist, setShowAddToPlaylist] = useState(false);
  const [showShareModal, setShowShareModal] = useState(null);
  const [showMediaItemDownload, setShowMediaItemDownload] = useState(null);
  const { isDownloaded, deleteDownload } = useDownload(showMediaItemOptions);

  useFocusEffect(
    useCallback(() => {
      analytics.screen('Journey');
    }, [])
  );

  useEffect(() => {
    setActiveSection(0);
    setActiveIndex(0);
  }, [mode]);

  useEffect(() => {
    const fetchData = async () => {
      if (activeIndex < 0 || activeSection < 0) {
        await AudioManager.trackPlayer.reset();
      } else if (sections && sections.length > 0) {
        const teachings = sections[activeSection].data[activeIndex].data;
        await AudioManager.setTracks(teachings);
      }
    };
    fetchData();
    return () => AudioManager.trackPlayer.reset();
  }, [activeIndex, activeSection, sections]);

  /* Render */
  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <Header
        config={{
          ui: {
            title: t('teaching.header'),
            leftButtonImage: Theme.images.back
          },
          hooks: {
            onLeftButtonPress: () => {
              goBack();
            }
          }
        }}
      />
      {/* Content */}
      <View style={{ flex: 1, flexDirection: 'column', backgroundColor: '#F5F5F5' }}>
        <View style={{ flex: 1, backgroundColor: 'transparent' }}>
          <DisplayMode mode={mode} setMode={setMode} />
          <SectionList
            key={mode}
            refreshing={loading}
            onEndReached={loadMore}
            contentContainerStyle={{ paddingBottom: 20 }}
            sections={sections}
            keyExtractor={item => item.title}
            renderItem={({ item, index, section }) => {
              const sectionIndex = sections.indexOf(section);
              const isActive = activeSection === sectionIndex && activeIndex === index;
              return (
                <View>
                  <TouchableOpacity
                    style={layoutStyles.subSection}
                    onPress={() => {
                      if (isActive) {
                        setActiveSection(-1);
                      } else {
                        setActiveSection(sectionIndex);
                        setActiveIndex(index);
                      }
                    }}
                  >
                    <SubSectionHeader
                      title={item.title}
                      size={item.data.length}
                      isActive={isActive}
                    />
                  </TouchableOpacity>
                  <View
                    style={{
                      zIndex: 0,
                      backgroundColor: '#FFFFFF',
                      marginHorizontal: 30,
                      marginTop: -60,
                      marginBottom: 16,
                      paddingTop: 60,
                      borderRadius: 12,
                      overflow: 'hidden'
                    }}
                  >
                    <Collapsible style={{ zIndex: 0 }} collapsed={!isActive}>
                      <MediaList
                        data={item.data}
                        onSelectItem={selectedItem => {
                          AudioManager.skipToTrack(selectedItem.id);
                        }}
                        onOptionsPressed={selectedItem => {
                          setShowMediaItemOptions(selectedItem);
                        }}
                      />
                    </Collapsible>
                  </View>
                </View>
              );
            }}
            renderSectionHeader={({ section: { title } }) => <SectionHeader title={title} />}
          />
        </View>
        {loading && <ActivityIndicator />}
        <Player startMinimized />
        <Observer>
          {() => (
            <OptionsModal
              show={!!showMediaItemOptions}
              title={showMediaItemOptions ? showMediaItemOptions.title : ' '}
              subtitle={showMediaItemOptions ? showMediaItemOptions.subtitle : ' '}
              icon={Theme.images.defaultIcon}
              close={() => setShowMediaItemOptions(null)}
            >
              <Option
                title={
                  showMediaItemOptions && favoritesState.isAdded(showMediaItemOptions)
                    ? t('options.audio.removeFavorite')
                    : t('options.audio.addFavorite')
                }
                icon={
                  showMediaItemOptions && favoritesState.isAdded(showMediaItemOptions)
                    ? Theme.images.options.minusSquare
                    : Theme.images.options.heartOutline
                }
                onPress={() => {
                  if (showMediaItemOptions) {
                    if (favoritesState.isAdded(showMediaItemOptions)) {
                      favoritesState.removeTrack(showMediaItemOptions);
                    } else {
                      favoritesState.addTrack(showMediaItemOptions);
                    }
                  }
                }}
              />
              <Option
                title={t('options.audio.addPlaylist')}
                icon={Theme.images.options.addSong}
                onPress={() => {
                  setShowAddToPlaylist(true);
                }}
              />
              <Option
                title={t('options.shared.share')}
                icon={Theme.images.options.share}
                onPress={() => {
                  setShowShareModal(showMediaItemOptions);
                  setShowMediaItemOptions(null);
                }}
              />
              <Option
                title={
                  isDownloaded ? t('options.audio.removeDownload') : t('options.audio.download')
                }
                icon={
                  isDownloaded ? Theme.images.options.minusSquare : Theme.images.options.download
                }
                onPress={() => {
                  if (isDownloaded) {
                    deleteDownload(showMediaItemOptions);
                  } else {
                    setShowMediaItemDownload(showMediaItemOptions);
                    setShowMediaItemOptions(null);
                  }
                }}
              />
              <Option
                title={t('options.shared.report')}
                icon={Theme.images.options.report}
                onPress={() => {}}
              />
              <AddToPlaylist
                track={showMediaItemOptions}
                show={showAddToPlaylist}
                close={() => setShowAddToPlaylist(false)}
              />
            </OptionsModal>
          )}
        </Observer>
        <ShareModal
          show={!!showShareModal}
          close={() => setShowShareModal(null)}
          item={showShareModal}
        />
        <DownloadModal
          show={!!showMediaItemDownload}
          close={() => setShowMediaItemDownload(null)}
          track={showMediaItemDownload}
        />
      </View>
    </View>
  );
};
