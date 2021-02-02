/**
 * @flow
 */

import * as React from 'react';
import { View, Text, Image, TouchableOpacity, Dimensions } from 'react-native';
import Theme from 'TTB/src/theme/Theme';
import PageControl from 'react-native-page-control';
import { t } from 'TTB/src/services/i18n';
import colors from '../../../theme/colors';

/* MARK: - UI Components */
const styles = {
  title: {
    fontFamily: 'Noto Serif',
    fontWeight: '600',
    fontSize: 28,
    lineHeight: 38,
    textAlign: 'center',
    letterSpacing: 0.116667,
    color: '#161B25'
  },
  subTitle: {
    fontFamily: 'Noto Sans',
    fontSize: 14,
    lineHeight: 19,
    textAlign: 'center',
    letterSpacing: 0.1,
    color: '#424F78',
    marginHorizontal: 80,
    marginTop: 20
  },
  skipButton: {
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'right',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginRight: 3
  },
  tutorialPicture: {
    position: 'absolute',
    alignSelf: 'center',
    bottom: Dimensions.get('window').height < 600 ? -210 : -100,
    zIndex: 20
  },
  container: {
    marginTop: 30,
    alignItems: 'flex-end'
  }
};

export const TutorialPage = ({
  title,
  subtitle,
  image,
  modal,
  page,
  designLinear = false,
  last = false
}: {
  title: String,
  subtitle: String,
  image: Image,
  modal: Function,
  page: Number,
  designLinear?: Boolean,
  last?: Boolean
}) => (
  <View
    style={{
      flex: 1,
      backgroundColor: colors.background,
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'stretch'
    }}
  >
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => {
          modal(false);
        }}
      >
        <View
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexDirection: 'row',
            margin: 50
          }}
        >
          <Text style={styles.skipButton}>
            {last ? t('tutorialPage.done') : t('tutorialPage.done')}
          </Text>
          <Image source={Theme.images.tutorials.skipArrow} style={{ paddingLeft: 3 }} />
        </View>
      </TouchableOpacity>
    </View>
    <View
      style={{
        flex: 1
      }}
    >
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subTitle}>{subtitle}</Text>
      <PageControl
        style={{ marginTop: 30 }}
        numberOfPages={7}
        currentPage={page}
        hidesForSinglePage
        pageIndicatorTintColor="#abc7d4"
        currentPageIndicatorTintColor="#006FA1"
        indicatorStyle={{ borderRadius: 5 }}
        currentIndicatorStyle={{ borderRadius: 5 }}
        indicatorSize={{ width: 8, height: 8 }}
      />
    </View>
    <Image style={styles.tutorialPicture} source={image} />
    {designLinear && (
      <>
        <Image
          style={{
            position: 'absolute',
            bottom: Dimensions.get('window').height < 600 ? 0 : 150,
            alignSelf: 'flex-end',
            marginTop: 20,
            zIndex: -100
          }}
          source={Theme.images.tutorials.tutorialDesign1}
        />
        <Image
          style={{ marginBottom: 20, zIndex: -100 }}
          source={Theme.images.tutorials.tutorialDesign1}
        />
      </>
    )}
    {!designLinear && (
      <>
        <Image
          style={{
            alignSelf: 'flex-end',
            position: 'absolute',
            marginBottom: 20,
            zIndex: -100
          }}
          source={Theme.images.tutorials.tutorialDesign2}
        />
      </>
    )}
  </View>
);

TutorialPage.defaultProps = {
  last: false,
  designLinear: false
};
