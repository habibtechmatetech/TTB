/**
 * @flow
 */

import React, { useState } from 'react';
import { View, Image, ScrollView, Keyboard } from 'react-native';
import { Text, SearchBar, Button } from 'react-native-elements';
import { useNavigation } from 'react-navigation-hooks';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { Button as DarkButton, Header } from 'TTB/src/theme/Components';
import Theme from 'TTB/src/theme/Theme';
import { KeyboardHidden } from 'TTB/src/lib/utils';
import { t } from 'TTB/src/services/i18n';
import colors from '../../../theme/colors';
import { useLanguageList } from './SelectLanguage.hooks';
import type { UILanguage } from './SelectLanguage.hooks';

/* MARK: - Layout Styles */

const layoutStyles = {
  innerContainer: {
    height: '75%',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    marginBottom: '5%'
  },
  headerContainer: {
    height: '18%',
    justifyContent: 'center'
  },
  searchBoxContainer: {
    height: '15%',
    justifyContent: 'center'
  },
  listContainer: {
    flexGrow: 1,
    height: '45%',
    justifyContent: 'center',
    paddingTop: '5%'
  },
  buttonContainer: {
    height: '20%',
    justifyContent: 'center'
  }
};

/* MARK: - UI Components */

export default () => {
  /* Hooks */
  const [searchValue, setSearchValue] = useState<string>('');
  const {
    initializing,
    getLanguageList,
    selectLanguage,
    filterLanguageList,
    applySelectedLanguage,
    applyingChanges,
    languageSelectionIsValid
  } = useLanguageList();
  const navigation = useNavigation();
  /* Render */
  return initializing ? (
    <></>
  ) : (
    <>
      <View style={{ backgroundColor: colors.background }}>
        <Image style={{ ...Theme.palette.topRightOval }} source={Theme.images.cornerOval} />
        <Header
          config={{
            ui: {
              leftButtonImage: Theme.images.back
            },
            hooks: {
              onLeftButtonPress: () => {
                navigation.goBack();
              },
              onRightButtonPress: () => {}
            }
          }}
        />
      </View>
      <View style={{ zIndex: -999, position: 'relative', ...Theme.palette.verticalContainer }}>
        <View style={{ ...layoutStyles.innerContainer }}>
          {/* HEADER */}
          <KeyboardHidden>
            <View style={{ ...layoutStyles.headerContainer }}>
              <Text style={{ ...Theme.palette.header }}>{t('selectLanguage.heading')}</Text>
            </View>
          </KeyboardHidden>

          {/* SEARCH BOX */}
          <View style={{ ...layoutStyles.searchBoxContainer }}>
            <SearchBar
              value={searchValue}
              onChangeText={val => {
                setSearchValue(val);
                filterLanguageList(val);
              }}
              onClear={Keyboard.dismiss}
              round
              inputStyle={{ ...Theme.palette.fieldInputStyle, paddingLeft: 0 }}
              containerStyle={{ ...Theme.palette.fieldContainerStyle }}
              inputContainerStyle={{ ...Theme.palette.fieldInputContainerStyle }}
              placeholder={t('uiControls.searchBox.placeholder')}
            />
          </View>

          {/* LANGUAGE LIST */}
          <View style={{ ...layoutStyles.listContainer }}>
            <ScrollView keyboardShouldPersistTaps="handled">
              {getLanguageList().map((language, index) => (
                <LanguageListItem
                  /* eslint-disable-next-line react/no-array-index-key */
                  key={`language.name-${index}`}
                  language={language}
                  onPress={() => {
                    selectLanguage(language);
                    Keyboard.dismiss();
                  }}
                />
              ))}
            </ScrollView>
          </View>

          {/* CALL TO ACTION BUTTON */}
          <KeyboardHidden>
            <View style={{ ...layoutStyles.buttonContainer }}>
              <DarkButton
                disabled={applyingChanges || !languageSelectionIsValid()}
                onPress={applySelectedLanguage}
                title={t('selectLanguage.mainAction')}
              />
            </View>
          </KeyboardHidden>
        </View>
      </View>
    </>
  );
};

const LanguageListItem = ({ language, onPress }: { language: UILanguage, onPress: Function }) => {
  /* Computed properties */
  const colorTheme = language.isSelected
    ? {
        text: Theme.colors.listItemTextSelected,
        background: Theme.colors.listItemSelected
      }
    : {
        text: Theme.colors.listItemText,
        background: Theme.colors.listItem
      };

  /* Render */
  return (
    <Button
      title={language.name}
      onPress={onPress}
      icon={
        <Icon
          name="language"
          color={colorTheme.text}
          size={Theme.palette.listItemIconSize.fontSize}
        />
      }
      buttonStyle={{ backgroundColor: colorTheme.background, ...Theme.palette.listItemButtonStyle }}
      containerStyle={{ ...Theme.palette.listItemContainerStyle }}
      titleStyle={{ color: colorTheme.text, ...Theme.palette.listItemTitleStyle }}
    />
  );
};
