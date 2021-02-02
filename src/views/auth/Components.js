/**
 * @flow
 */

import React from 'react';
import { View, Text, Image, TouchableHighlight } from 'react-native';
import { Divider } from 'react-native-elements';
import EStyleSheet from 'react-native-extended-stylesheet';

import Theme from 'TTB/src/theme/Theme';

/* MARK: - Layout Styles */

const layoutStyles = EStyleSheet.create({
  socialLoginImageContainer: {
    paddingVertical: '15rem',
    paddingHorizontal: '10rem'
  },
  socialLoginImage: {
    width: '40 rem',
    height: '40 rem',
    aspectRatio: 1
  }
});

export const SocialContainer = ({
  header,
  onFacebookPress,
  onGooglePress
}: {
  header: string,
  onFacebookPress: Function,
  onGooglePress: Function
}) => (
  <>
    {/* HEADER */}
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
      <Divider style={{ flex: 1, height: 3, backgroundColor: Theme.colors.divider }} />
      <Text style={{ paddingHorizontal: 15, ...Theme.palette.h6 }}>{header}</Text>
      <Divider style={{ flex: 1, height: 3, backgroundColor: Theme.colors.divider }} />
    </View>

    {/* BUTTONS */}
    <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
      <TouchableHighlight underlayColor="transparent" onPress={onFacebookPress}>
        <View style={{ ...layoutStyles.socialLoginImageContainer }}>
          <Image style={{ ...layoutStyles.socialLoginImage }} source={Theme.images.facebook} />
        </View>
      </TouchableHighlight>
      <TouchableHighlight underlayColor="transparent" onPress={onGooglePress}>
        <View style={{ ...layoutStyles.socialLoginImageContainer }}>
          <Image style={{ ...layoutStyles.socialLoginImage }} source={Theme.images.google} />
        </View>
      </TouchableHighlight>
    </View>
  </>
);
