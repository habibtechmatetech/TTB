/**
 * @flow
 */

import React, { useState } from 'react';
import EStyleSheet from 'react-native-extended-stylesheet';
import {
  Image,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  RefreshControl,
  FlatList
} from 'react-native';
import Theme from 'TTB/src/theme/Theme';
import DraggableFlatList, { RenderItemParams } from 'react-native-draggable-flatlist';
import { SwipeRow } from 'react-native-swipe-list-view';
import type { Playlist, Audio } from 'TTB/src/lib/types';
import {
  useTrackPlayerEvents,
  usePlaybackState,
  STATE_PLAYING,
  STATE_PAUSED
} from 'react-native-track-player';
import { observer } from 'mobx-react';
import { t } from 'TTB/src/services/i18n';
import AudioManager from '../services/audio';

const styles = EStyleSheet.create({
  mediaItemContainer: {
    backgroundColor: 'white'
  },
  mediaItem: {
    padding: 14,
    marginLeft: 14,
    marginRight: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 12
  },
  mediaItemDelete: {
    padding: 14,
    flexDirection: 'row',
    alignItems: 'stretch',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    backgroundColor: Theme.colors.delete,
    width: 108,
    borderTopLeftRadius: 35,
    borderBottomLeftRadius: 35
  },
  mediaItemDeleteText: {
    fontSize: 14,
    color: '#FFFFFF',
    letterSpacing: 0,
    lineHeight: 21
  },
  mediaItemActive: {
    backgroundColor: Theme.colors.listItemTextSelected,
    shadowColor: 'black',
    shadowRadius: 40,
    shadowOpacity: 0.1
  },
  mediaListLeft: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  mediaListIndex: {
    ...Theme.palette.mediaListIndex,
    marginRight: 20
  },
  mediaItemTitle: {
    fontSize: 12,
    color: '#2A324B',
    letterSpacing: 0
  },
  mediaItemSubtitle: {
    fontSize: 12,
    color: '#2A324B',
    letterSpacing: 0,
    opacity: 0.6
  }
});

type MediaItemProps =
  | RenderItemParams
  | {
      item: Playlist,
      index: number,
      drag: any,
      dragEnd: any,
      onDelete: any,
      onSelect: any,
      onOptionsPressed: any,
      isPlaying: boolean,
      isActive: boolean,
      sortable: boolean,
      editable: boolean
    };

const MediaItem = ({
  item,
  index,
  drag,
  dragEnd,
  onDelete,
  onSelect,
  onOptionsPressed,
  isPlaying,
  isActive,
  sortable,
  editable
}: MediaItemProps) => {
  return (
    <SwipeRow
      rightOpenValue={-108}
      stopRightSwipe={-108}
      disableRightSwipe
      disableLeftSwipe={!editable}
    >
      <View
        style={{
          ...styles.mediaItemDelete
        }}
      >
        <TouchableOpacity onPress={() => onDelete(item)}>
          <Text style={{ ...styles.mediaItemDeleteText }}>{t('mediaList.remove')}</Text>
        </TouchableOpacity>
      </View>
      <View
        style={{
          ...styles.mediaItemContainer
        }}
      >
        <TouchableHighlight
          style={{
            ...styles.mediaItem,
            ...(isActive ? styles.mediaItemActive : {})
          }}
          onLongPress={sortable ? drag : null}
          onPressOut={dragEnd}
          onPress={onSelect}
          underlayColor={Theme.colors.mediaList.itemHighlight}
        >
          <>
            <View
              style={{
                ...styles.mediaListLeft
              }}
            >
              <Text
                style={{
                  ...styles.mediaListIndex
                }}
              >
                {index + 1}
              </Text>
              <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
                <Text
                  style={{
                    ...styles.mediaItemTitle,
                    ...(isPlaying ? { color: Theme.colors.mediaList.textHighlight } : {})
                  }}
                >
                  {item.name || item.title}
                </Text>
                <Text
                  style={{
                    ...styles.mediaItemSubtitle
                  }}
                >
                  {/* eslint-disable-next-line no-nested-ternary */}
                  {item.subtitle
                    ? item.subtitle
                    : item.items
                    ? `${item.items.length} ${t('mediaList.tracksLabel')}`
                    : ''}
                </Text>
              </View>
            </View>
            {onOptionsPressed && (
              <TouchableOpacity
                style={{ width: 42, height: 42, justifyContent: 'center', alignItems: 'center' }}
                onPress={onOptionsPressed}
              >
                <Image source={Theme.images.media.options} />
              </TouchableOpacity>
            )}
          </>
        </TouchableHighlight>
      </View>
    </SwipeRow>
  );
};

export default observer(
  ({
    data,
    onDeleteItem,
    onSort,
    onSelectItem,
    onOptionsPressed,
    onRefresh,
    refreshing,
    sortable = false,
    editable = false
  }: {
    data: [Playlist],
    onDeleteItem: any,
    onSort: any,
    onSelectItem: any,
    onOptionsPressed: any,
    sortable: boolean,
    editable: boolean,
    refreshing: boolean,
    onRefresh: any
  }) => {
    const [track, setTrack] = useState<?Audio>(null);
    const playingState = usePlaybackState();
    useTrackPlayerEvents(['playback-track-changed'], async () => {
      const trackId = await AudioManager.currentTrackId();
      const currentTrack = await AudioManager.trackPlayer.getTrack(trackId);
      setTrack(currentTrack);
    });

    const RenderItem = ({ item, index, drag, dragEnd, isActive }: RenderItemParams) => (
      <MediaItem
        item={item}
        index={index}
        drag={drag}
        dragEnd={dragEnd}
        isActive={isActive}
        editable={editable}
        sortable={sortable}
        isPlaying={
          (playingState === STATE_PLAYING || playingState === STATE_PAUSED) &&
          track &&
          track.id === item.id
        }
        onDelete={() => onDeleteItem(item)}
        onSelect={() => onSelectItem(item)}
        onOptionsPressed={onOptionsPressed ? () => onOptionsPressed(item) : null}
      />
    );

    if (sortable) {
      return (
        <DraggableFlatList
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          activationDistance={editable ? 10 : Number.MAX_SAFE_INTEGER}
          data={data}
          renderItem={RenderItem}
          keyExtractor={item => `media-item-${item.id || item.order || item.name}`}
          onDragEnd={onSort}
        />
      );
    }

    return (
      <FlatList
        refreshing={refreshing}
        onRefresh={onRefresh}
        data={data}
        renderItem={RenderItem}
        keyExtractor={item => `media-item-${item.id || item.order || item.name}`}
        onDragEnd={onSort}
      />
    );
  }
);
