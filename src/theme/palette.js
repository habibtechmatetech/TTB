/**
 * @flow
 */

import EStyleSheet from 'react-native-extended-stylesheet';
import colors from './colors';

// designs were done on an iPhone 11 screen size (logical width of 375 points)
export const REM_SCALE = 375.0;

const palette = EStyleSheet.create({
  image: {
    '@media (direction: rtl)': {
      transform: [{ scaleX: -1 }]
    }
  },
  topRightOval: {
    position: 'absolute',
    height: '139rem',
    top: 0,
    right: 0,
    '@media (direction: rtl)': {
      transform: [{ scaleX: -1 }]
    }
  },
  bottomLeftShape: {
    position: 'absolute',
    width: '80rem',
    height: '147rem',
    left: 0,
    bottom: '7%',
    '@media (direction: rtl)': {
      transform: [{ scaleX: -1 }]
    }
  },
  bottomLeftOval: {
    position: 'absolute',
    width: '163rem',
    height: '139rem',
    bottom: 0,
    left: 0,
    transform: [{ scaleY: -1 }],
    '@media (direction: ltr)': {
      transform: [{ scaleX: -1 }, { scaleY: -1 }]
    }
  },
  dotPattern: {
    position: 'absolute',
    width: 104,
    height: 124,
    top: 303,
    right: 0
  },
  item: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    overflow: 'hidden',
    top: 0,
    left: 0
  },
  linePattern: {
    position: 'absolute',
    width: 104,
    height: 124,
    top: 303,
    right: 0
  },
  header: {
    color: colors.text,
    fontSize: '32rem',
    lineHeight: '41rem',
    textAlign: 'left',
    fontFamily: 'NotoSerif-Bold'
  },
  h1: {
    fontSize: '27 rem',
    fontFamily: 'NotoSerif-Bold',
    color: colors.mainAction
  },
  h2: {
    fontSize: '24 rem',
    fontFamily: 'NotoSerif-SemiBold',
    lineHeight: '33 rem'
  },
  h3: {
    fontSize: '28 rem',
    fontFamily: 'NotoSerif-SemiBold',
    lineHeight: '38 rem',
    color: colors.mainAction
  },
  h4: {
    fontSize: '18 rem',
    fontFamily: 'NotoSerif-SemiBold',
    lineHeight: '24 rem',
    color: colors.mainAction
  },
  h6: {
    fontFamily: 'NotoSans-Regular',
    fontSize: '14rem',
    color: colors.h6,
    fontWeight: 'normal'
  },
  h7: {
    fontFamily: 'NotoSans-SemiBold',
    fontSize: '12rem',
    color: colors.h6,
    fontWeight: 'normal'
  },
  h8: {
    fontFamily: 'NotoSans-Regular',
    fontSize: '13rem',
    color: colors.h6,
    fontWeight: 'normal'
  },
  h9: {
    fontFamily: 'NotoSans-SemiBold',
    fontSize: '16rem',
    color: colors.h6,
    fontWeight: 'normal'
  },
  subhead4: {
    fontFamily: 'NotoSans-SemiBold',
    fontSize: '13rem',
    color: colors.h6
  },
  closeText: {
    fontFamily: 'NotoSans-SemiBold',
    fontSize: '13rem',
    color: 'white'
  },
  mediaListIndex: {
    fontFamily: 'NotoSans-Regular',
    fontSize: '15 rem',
    color: colors.mediaList.index,
    letterSpacing: 0,
    textAlign: 'center'
  },
  fieldInputStyle: {
    fontFamily: 'NotoSans-Regular',
    '@media (direction: rtl)': {
      textAlign: 'right'
    },
    paddingLeft: '15 rem',
    fontSize: '14rem'
  },
  fieldContainerStyle: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    shadowColor: 'black',
    shadowOffset: { width: 0, height: '6rem' },
    shadowOpacity: 0.1,
    shadowRadius: '10rem',
    paddingHorizontal: 0
  },
  fieldInputContainerStyle: {
    '@media android': {
      borderWidth: 0.5,
      borderColor: 'gray',
      elevation: 1
    },
    backgroundColor: colors.uiField,
    minHeight: '50 rem',
    borderRadius: 12,
    borderBottomWidth: 0
  },
  fieldIcon: {
    fontSize: '22rem',
    color: colors.fieldIcon
  },
  listItemContainerStyle: {
    paddingTop: '15rem'
  },
  listItemButtonStyle: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingLeft: '17rem',
    borderRadius: '50rem',
    height: '50rem'
  },
  listItemTitleStyle: {
    fontFamily: 'NotoSans-Regular',
    fontSize: '16rem',
    marginLeft: '17rem'
  },
  listItemIconSize: {
    fontSize: '24rem'
  },
  mainActionContainerStyle: {
    // shadowColor: 'black',
    // shadowOffset: { width: 0, height: '15rem' },
    // shadowOpacity: 0.3,
    // shadowRadius: '10rem'
  },
  mainActionButtonStyle: {
    backgroundColor: colors.mainAction,
    height: '60rem',
    borderRadius: '12rem'
  },
  mainActionTitleStyle: {
    fontFamily: 'NotoSans-Regular',
    fontSize: '16rem',
    color: colors.mainActionText
  },
  linkAction: {
    fontFamily: 'NotoSans-Regular',
    fontSize: '16rem',
    height: 48,
    lineHeight: 48
  },
  verticalContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    alignItems: 'stretch',
    backgroundColor: colors.background,
    paddingHorizontal: '10%'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'stretch',
    backgroundColor: colors.background
  }
});

export default palette;
