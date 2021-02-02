/* eslint-disable react/destructuring-assignment */
/* eslint-disable react/jsx-props-no-spreading */
/**
 * @flow
 */

import React, { UIEventHandler, useState } from 'react';
import { View, Image, Text, TouchableHighlight, TouchableOpacity, StyleProp } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {
  Header as RNHeader,
  Button as RNButton,
  Input as RNInput,
  CheckBox as RNCheckBox
} from 'react-native-elements';
import RNModalSelector from 'react-native-modal-selector';
import I18nManager, { t } from 'TTB/src/services/i18n';
import EStyleSheet from 'react-native-extended-stylesheet';
import Theme from './Theme';

/* MARK: - UI Components */
type HeaderStyle = 'light' | 'dark';

export type HeaderConfig = {|
  headerStyle: HeaderStyle,
  ui: {
    title: string,
    leftButtonImage: any,
    rightButtonImage: any,
    rightButtonContent: any
  },
  hooks: {
    onLeftButtonPress: Function,
    onRightButtonPress: Function
  }
|};
export const Header = ({ config }: { config: HeaderConfig }) => (
  <RNHeader
    backgroundColor="transparent"
    containerStyle={{ borderBottomWidth: 0, marginHorizontal: '2%' }}
  >
    <TouchableHighlight
      style={{ padding: 12 }}
      underlayColor="transparent"
      onPress={config.hooks.onLeftButtonPress}
    >
      <Image source={config.ui.leftButtonImage} />
    </TouchableHighlight>

    <Text
      style={{
        ...Theme.palette.h4,
        ...(config.headerStyle === 'light' ? { color: Theme.colors.header.light.title } : {})
      }}
    >
      {config.ui.title}
    </Text>

    <TouchableHighlight
      style={{ padding: 12 }}
      underlayColor="transparent"
      onPress={config.hooks.onRightButtonPress}
    >
      {config.ui.rightButtonContent ? (
        config.ui.rightButtonContent
      ) : (
        <Image source={config.ui.rightButtonImage} />
      )}
    </TouchableHighlight>
  </RNHeader>
);

export const ModalSelector = (props: any) => (
  <RNModalSelector
    overlayStyle={{ justifyContent: 'flex-end' }}
    optionContainerStyle={{ backgroundColor: Theme.colors.listItem }}
    cancelStyle={{ backgroundColor: Theme.colors.listItem }}
    optionTextStyle={{ color: Theme.colors.listItemText, fontFamily: 'NotoSans-Regular' }}
    selectedItemTextStyle={{ color: Theme.colors.highlightAction }}
    cancelText={t('uiControls.modalSelector.cancel')}
    {...props}
  >
    {props.children}
  </RNModalSelector>
);

export const ImageButton = ({
  onPress,
  image,
  size = 48,
  mirrorRTL = false,
  color = 'transparent',
  colorHighlight,
  disabled = false
}: any) => (
  <TouchableHighlight
    disabled={disabled}
    style={{
      height: size,
      width: size,
      backgroundColor: color,
      borderRadius: size * 0.5,
      opacity: disabled ? 0.4 : 1
    }}
    underlayColor={colorHighlight}
    onPress={onPress}
  >
    <View
      style={{
        flex: 1,
        alignContent: 'center',
        justifyContent: 'center'
      }}
    >
      <Image
        style={
          mirrorRTL ? { alignSelf: 'center', ...Theme.palette.image } : { alignSelf: 'center' }
        }
        source={image}
      />
    </View>
  </TouchableHighlight>
);

export const Input = (props: any) => (
  <RNInput
    inputStyle={{ ...Theme.palette.fieldInputStyle }}
    inputContainerStyle={{ ...Theme.palette.fieldInputContainerStyle }}
    containerStyle={{ ...Theme.palette.fieldContainerStyle }}
    placeholderTextColor={Theme.palette.fieldIcon.color}
    leftIcon={
      props.icon ? (
        <Icon
          name={(props.icon: any)}
          size={Theme.palette.fieldIcon.fontSize}
          color={Theme.palette.fieldIcon.color}
        />
      ) : null
    }
    {...props}
  />
);

export const Button = (props: any) => {
  const color = props.dark ? Theme.colors.mainAction : Theme.colors.supportAction;

  return (
    <RNButton
      buttonStyle={{ ...Theme.palette.mainActionButtonStyle, backgroundColor: color }}
      containerStyle={{
        ...Theme.palette.mainActionContainerStyle,
        shadowColor: props.disabled ? 'grey' : color
      }}
      titleStyle={{ ...Theme.palette.mainActionTitleStyle }}
      disabledStyle={{ backgroundColor: Theme.colors.actionDisabled }}
      activeOpacity={1}
      {...props}
    />
  );
};

export const CheckBox = (props: any) => (
  <RNCheckBox
    checkedColor={Theme.colors.checkbox}
    containerStyle={{ backgroundColor: 'transparent', paddingHorizontal: 0, borderWidth: 0 }}
    textStyle={{ ...Theme.palette.h6 }}
    {...props}
  />
);

export const LinkButton = (props: any) => {
  const color = props.dark ? Theme.colors.text : Theme.colors.supportAction;

  return <RNButton titleStyle={{ ...Theme.palette.linkAction, color }} type="clear" {...props} />;
};

export type SectionProps = {|
  title: string,
  subtitle: string,
  children: any
|};

export const Section = (props: SectionProps) => {
  return (
    <View
      style={
        I18nManager.isRTL()
          ? {
              marginLeft: 24,
              marginVertical: 20,
              flexDirection: 'column',
              alignItems: 'flex-start'
            }
          : { marginLeft: 24, marginVertical: 20 }
      }
    >
      <Text style={{ ...Theme.palette.h2 }}>{props.title}</Text>
      <Text style={{ ...Theme.palette.h8 }}>{props.subtitle}</Text>
      {props.children}
    </View>
  );
};

export type CollectionItemProps = {|
  title: string,
  subtitle: string,
  onPress: any,
  type: int
|};
const CollectionItemStyle = EStyleSheet.create({
  background: {
    backgroundColor: Theme.colors.collectionItem,
    borderRadius: 11,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: '45%',
    margin: 4,
    flexDirection: 'row',
    height: 99,
    overflow: 'hidden'
  },
  title: {
    marginTop: -8,
    marginBottom: 10,
    fontFamily: 'NotoSerif-Bold',
    fontSize: '14rem',
    color: Theme.colors.mainActionText
  },
  subtitle: { fontFamily: 'NotoSans-Bold', fontSize: '10rem', color: Theme.colors.mainActionText }
});
export const CollectionItem = (props: CollectionItemProps) => {
  return (
    <TouchableOpacity onPress={props.onPress} style={{ ...CollectionItemStyle.background }}>
      {!props.type && <Image style={{ ...Theme.palette.item }} source={Theme.images.item.item0} />}
      {props.type === 1 && (
        <Image style={{ ...Theme.palette.item }} source={Theme.images.item.item1} />
      )}
      {props.type === 2 && (
        <Image style={{ ...Theme.palette.item }} source={Theme.images.item.item2} />
      )}
      {props.type === 3 && (
        <Image style={{ ...Theme.palette.item }} source={Theme.images.item.item3} />
      )}
      <View style={{ flexDirection: 'column', alignItems: 'flex-start', padding: 20 }}>
        <Text numberOfLines={2} style={{ ...CollectionItemStyle.title }}>
          {props.title}
        </Text>
        <Text style={{ ...CollectionItemStyle.subtitle }}>{props.subtitle}</Text>
      </View>
    </TouchableOpacity>
  );
};

// eslint-disable-next-line react/prop-types
export const TouchableButton = ({
  style,
  buttonStyle = {},
  underlayColor,
  children,
  onPress,
  color,
  selected = false
}: {
  style: StyleProp,
  buttonStyle: StyleProp,
  underlayColor: string,
  children: any,
  onPress: UIEventHandler,
  color: string,
  selected: boolean
}) => {
  const [highlighted, setHighlighted] = useState(false);
  return (
    <View
      style={{
        ...style,
        backgroundColor: selected || highlighted ? underlayColor : color || 'transparent'
      }}
    >
      <TouchableOpacity
        style={{ width: '100%', ...buttonStyle }}
        onPressIn={() => {
          setHighlighted(true);
        }}
        onPressOut={() => {
          setHighlighted(false);
        }}
        onPress={onPress}
      >
        {children}
      </TouchableOpacity>
    </View>
  );
};
