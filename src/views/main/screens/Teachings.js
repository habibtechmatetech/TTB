/**
 * @flow
 */

import React, { useCallback, useState } from 'react';
import {
  View,
  Image,
  TouchableHighlight,
  Text,
  Modal,
  ScrollView,
  Dimensions,
  TouchableOpacity
} from 'react-native';
import { useFocusEffect, useNavigation } from 'react-navigation-hooks';
import analytics from '@segment/analytics-react-native';
import { Header, Section, CollectionItem } from 'TTB/src/theme/Components';
import { t } from 'TTB/src/services/i18n';
import Theme from 'TTB/src/theme/Theme';
import Teaching from 'TTB/src/views/main/screens/Teaching';
import type { Testament } from 'TTB/src/lib/types';
import { useSafeArea } from 'react-native-safe-area-context';
import { useDailyTeaching, useCollection } from './Teachings.hooks';

/* MARK: - Layout Styles */

const layoutStyles = {
  dailyTeaching: {
    paddingVertical: '5%'
  }
};

/* MARK: - UI Components */

const Collection = ({ testament }: { testament: Testament }) => {
  const { navigate } = useNavigation();
  const width = Dimensions.get('window').width - 24;
  const collectionGroup = useCollection(testament);
  return (
    <ScrollView horizontal pagingEnabled>
      {collectionGroup.map((page, index) => {
        const pageKey = `${testament}-page-${index}`;
        return (
          <View
            key={pageKey}
            style={{
              width,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'stretch',
              flexWrap: 'wrap'
            }}
          >
            {page.map((collection, index) => {
              const numTracks = collection.book.numberOfTeachings;
              return (
                <CollectionItem
                  key={collection.collection}
                  title={collection.collection}
                  subtitle={`${numTracks} ${t('teachings.tracksLabel')}`}
                  type={index}
                  onPress={async () => {
                    navigate('Collection', {
                      bookId: collection.book.bookId,
                      name: collection.collection
                    });
                  }}
                />
              );
            })}
          </View>
        );
      })}
    </ScrollView>
  );
};

const DailyTeaching = () => {
  /* Hooks */
  const dailyTeaching = useDailyTeaching();
  const [modalShown, setModalShown] = useState<boolean>(false);

  /* Render */
  return dailyTeaching == null ? (
    <></>
  ) : (
    <>
      <Modal animationType="slide" transparent={false} visible={modalShown}>
        <Teaching teachings={[dailyTeaching]} dismiss={() => setModalShown(false)} />
      </Modal>

      <TouchableHighlight underlayColor="transparent" onPress={() => setModalShown(true)}>
        <View style={{ width: '90%', aspectRatio: 327.0 / 222.0, alignSelf: 'center' }}>
          {/* Background Image */}
          <Image
            style={{ position: 'absolute', width: '100%', height: '100%' }}
            source={Theme.images.teachings.dailyBackground}
            resizeMode="stretch"
          />
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', borderRadius: 24 }}>
            <View
              style={{
                paddingHorizontal: '10%',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                top: 0,
                height: '40%',
                position: 'absolute'
              }}
            >
              <Text
                style={{
                  ...Theme.palette.h4,
                  color: Theme.colors.mainActionText,
                  textAlign: 'left'
                }}
              >
                {dailyTeaching.title}
              </Text>
              <Text
                style={{
                  ...Theme.palette.h7,
                  color: Theme.colors.mainActionText,
                  textAlign: 'left'
                }}
              >
                {dailyTeaching.formattedDate}
              </Text>
            </View>

            <View
              style={{
                paddingLeft: '7%',
                paddingRight: '5%',
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center',
                bottom: 0,
                position: 'absolute',
                width: '100%',
                height: '40%'
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', height: '100%' }}>
                <Image source={Theme.images.teachings.dailyLeftIcon} />
                <Text
                  style={{
                    marginLeft: 10,
                    ...Theme.palette.h6,
                    color: Theme.colors.mainActionText,
                    textAlign: 'left'
                  }}
                >
                  {t('teachings.dailyText')}
                </Text>
              </View>

              <Image source={Theme.images.teachings.dailyPlay} />
            </View>
          </View>
        </View>
      </TouchableHighlight>
    </>
  );
};

export default () => {
  /* Hooks */
  const navigation = useNavigation();
  const insets = useSafeArea();

  useFocusEffect(
    useCallback(() => {
      analytics.screen('Teachings');
    }, [])
  );

  /* Render */
  return (
    <View style={{ ...Theme.palette.container }}>
      {/* Background Image */}
      <Image style={{ ...Theme.palette.dotPattern }} source={Theme.images.dotPattern} />

      {/* Header */}
      <Header
        config={{
          ui: {
            title: t('teaching.header'),
            leftButtonImage: Theme.images.menu.hamburger,
            rightButtonImage: Theme.images.search
          },
          hooks: {
            onLeftButtonPress: navigation.toggleDrawer,
            onRightButtonPress: () => {
              navigation.navigate('Search');
            }
          }
        }}
      />

      {/* Daily Teaching */}
      <ScrollView
        style={{ ...layoutStyles.dailyTeaching }}
        contentContainerStyle={{ paddingBottom: insets.bottom }}
      >
        <DailyTeaching />
        <Section title={t('teachings.journeyTitle')} subtitle={t('teachings.journeySubtitle')}>
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('Journey');
            }}
            style={{
              backgroundColor: 'white',
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              marginTop: 20,
              marginRight: 24,
              paddingVertical: 12,
              paddingHorizontal: 24,
              borderRadius: 17,
              borderColor: '#E7EEF6',
              borderWidth: 1,
              borderStyle: 'solid'
            }}
          >
            <View style={{ flexShrink: 1, flexDirection: 'column' }}>
              <Text
                style={{
                  ...Theme.palette.h7,
                  fontWeight: '600',
                  color: '#161B25',
                  marginBottom: 16
                }}
              >
                {t('teachings.journeyCardTitle')}
              </Text>
              <Text
                style={{
                  ...Theme.palette.h7,
                  color: '#424F78'
                }}
              >
                {t('teachings.journeyCardSubtitle')}
              </Text>
            </View>
            <Image source={Theme.images.teachings.books} />
          </TouchableOpacity>
        </Section>
        <Section title={t('bible.newTestament')} subtitle={t('bible.popularBooks')}>
          <Collection testament="NEW_TESTAMENT" />
        </Section>
        <Section title={t('bible.oldTestament')} subtitle={t('bible.popularBooks')}>
          <Collection testament="OLD_TESTAMENT" />
        </Section>
      </ScrollView>
    </View>
  );
};
