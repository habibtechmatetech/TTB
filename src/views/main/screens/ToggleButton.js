/**
 * @flow
 */

import React, { useState } from 'react';
import { Image, Text, TouchableHighlight, View } from 'react-native';
import Theme from '../../../theme/Theme';

export default ({
  style,
  selected = false,
  onPress,
  text,
  image,
  imageSelected
}: {
  style: any,
  selected: boolean,
  onPress: any,
  text: string,
  image: any,
  imageSelected: any
}) => {
  const [highlighted, setHighlighted] = useState(false);
  return (
    <TouchableHighlight
      style={{
        ...style,
        backgroundColor:
          selected || highlighted ? Theme.colors.toggle.colorHighlight : Theme.colors.toggle.color,
        height: 40,
        borderRadius: 12
      }}
      underlayColor={Theme.colors.toggle.colorHighlight}
      onShowUnderlay={() => setHighlighted(true)}
      onPress={onPress}
      onHideUnderlay={() => setHighlighted(false)}
    >
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row'
        }}
      >
        <Image source={highlighted || selected ? imageSelected : image} />
        <Text
          style={{
            marginLeft: 16,
            fontFamily: 'NotoSans-SemiBold',
            fontSize: 13,
            color:
              highlighted || selected ? Theme.colors.toggle.textHighlight : Theme.colors.toggle.text
          }}
        >
          {text}
        </Text>
      </View>
    </TouchableHighlight>
  );
};
