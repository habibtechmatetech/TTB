/**
 * @flow
 */

import React, { useEffect, useContext } from 'react';
import { View, Image, Text, Modal, TouchableOpacity, Platform, ScrollView } from 'react-native';
import EStyleSheet from 'react-native-extended-stylesheet';
import { Button as RNButton } from 'react-native-elements';
import Share from 'react-native-share';
import { useSafeArea } from 'react-native-safe-area-context';
import { useNavigation } from 'react-navigation-hooks';
import * as Progress from 'react-native-progress';
import Clipboard from '@react-native-community/clipboard';
import Theme from './Theme';
import type { Audio } from '../lib/types';
import { useDownloads } from '../views/main/screens/Downloads.hooks';
import { Context } from '../views/sharing/Wifip2p';
import { t } from '../services/i18n';

/* MARK: - UI Components */

const DecisionModalStyles = EStyleSheet.create({
  background: {
    backgroundColor: Theme.colors.modalBackground,
    position: 'absolute',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  backgroundImage: {
    height: '368 rem',
    width: '310 rem'
  },
  backgroundImageNoMessage: {
    height: '257 rem',
    width: '310 rem'
  },
  container: {
    position: 'absolute',
    height: '100%',
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  form: {
    marginTop: '100 rem',
    height: '209 rem',
    width: '262 rem',
    alignItems: 'center'
  },
  title: {
    marginBottom: '12 rem',
    textAlign: 'center'
  },
  message: {},
  formNoMessage: {
    marginTop: '100 rem',
    height: '98 rem',
    width: '262 rem',
    alignItems: 'center'
  },
  firstButtonContainer: {
    bottom: '58 rem',
    position: 'absolute'
  },
  firstButton: {
    height: '38rem',
    width: '172 rem',
    borderRadius: '25rem',
    backgroundColor: Theme.colors.mainAction
  },
  firstButtonTitle: {
    fontFamily: 'NotoSans-Bold',
    fontSize: '11rem',
    color: Theme.colors.mainActionText
  },
  secondButtonContainer: {
    bottom: '0 rem',
    position: 'absolute'
  },
  secondButton: {
    height: '38rem',
    width: '172 rem',
    borderRadius: '25rem',
    backgroundColor: 'transparent',
    borderWidth: '2 rem',
    borderColor: Theme.colors.mainAction
  },
  secondButtonTitle: {
    fontFamily: 'NotoSans-Bold',
    fontSize: '11rem',
    lineHeight: '11 rem',
    color: Theme.colors.mainAction
  },
  closeButton: {
    height: '50rem',
    width: '310rem',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: '12rem',
    backgroundColor: Theme.colors.button,
    marginLeft: 32,
    marginRight: 32,
    marginTop: 27,
    marginBottom: 17,
    flexDirection: 'row',
    alignSelf: 'center'
  }
});

const styles = EStyleSheet.create({
  divider: {
    height: 1,
    marginTop: 32,
    backgroundColor: Theme.colors.divider,
    marginHorizontal: 30
  },
  buttonContainer: {
    marginLeft: 33,
    marginRight: 33,
    marginTop: 24,
    height: 50,
    borderRadius: 12,
    backgroundColor: '#006FA1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  buttonText: {
    fontFamily: 'Noto Sans',
    fontStyle: 'normal',
    fontWeight: '600',
    fontSize: 13,
    lineHeight: 18,
    color: '#FFFFFF'
  },
  shareModalBackground: {
    flex: 1,
    backgroundColor: Theme.colors.modal.background,
    flexDirection: 'row'
  },
  shareModalView: {
    flexDirection: 'row'
  },
  shareModalContainer: {
    width: '100%',
    height: '90%',
    alignSelf: 'flex-end',
    backgroundColor: Theme.colors.player.background,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15
  },
  shareModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 30,
    marginVertical: 13,
    alignItems: 'center'
  },
  shareModalImage: {
    alignSelf: 'center',
    marginVertical: 24
  },
  shareModalScrollView: {
    paddingBottom: 30
  },
  shareModalItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 31,
    marginTop: 30
  },
  shareModalItemLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  shareModalItemLabelImage: {
    marginRight: 20
  },
  shareModalMoreItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 31,
    marginTop: 30,
    marginBottom: 30
  },
  shareModalMoreItemLabelImage: {
    marginRight: 29,
    marginLeft: 8
  }
});

export type DecisionModalConfig = {|
  ui: {
    title?: string,
    message?: string,
    background: any, // ImageSourcePropType
    firstButtonTitle: string,
    secondButtonTitle: string
  },
  hooks: {
    onFirstButtonPress: Function,
    onSecondButtonPress: Function
  }
|};
export const DecisionModal = ({ config }: { config: DecisionModalConfig }) => {
  const hasMessage = config.ui.title != null && config.ui.message != null;

  return (
    <>
      <View style={DecisionModalStyles.background}>
        <Image
          style={
            hasMessage
              ? DecisionModalStyles.backgroundImage
              : DecisionModalStyles.backgroundImageNoMessage
          }
          source={config.ui.background}
          resizeMode="stretch"
        />
      </View>
      <View style={DecisionModalStyles.container}>
        <View style={hasMessage ? DecisionModalStyles.form : DecisionModalStyles.formNoMessage}>
          {!hasMessage ? (
            <></>
          ) : (
            <>
              <Text style={{ ...Theme.palette.h4, ...DecisionModalStyles.title }}>
                {config.ui.title}
              </Text>
              <Text style={{ ...Theme.palette.h6, textAlign: 'center' }}>{config.ui.message}</Text>
            </>
          )}
          <RNButton
            buttonStyle={DecisionModalStyles.firstButton}
            titleStyle={DecisionModalStyles.firstButtonTitle}
            title={config.ui.firstButtonTitle}
            containerStyle={DecisionModalStyles.firstButtonContainer}
            onPress={config.hooks.onFirstButtonPress}
          />
          {!!config.hooks.onSecondButtonPress && (
            <RNButton
              buttonStyle={DecisionModalStyles.secondButton}
              titleStyle={DecisionModalStyles.secondButtonTitle}
              title={config.ui.secondButtonTitle}
              containerStyle={DecisionModalStyles.secondButtonContainer}
              onPress={config.hooks.onSecondButtonPress}
            />
          )}
        </View>
      </View>
    </>
  );
};

export const ActionModal = ({
  title,
  show,
  close,
  children
}: {
  title: string,
  show: boolean,
  close: any,
  children: any
}) => {
  const insets = useSafeArea();
  return (
    <Modal animationType="slide" transparent visible={show} onRequestClose={close}>
      <View
        style={{
          flex: 1,
          backgroundColor: Theme.colors.modal.background,
          flexDirection: 'row'
        }}
      >
        <View style={{ flexDirection: 'row' }}>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'stretch',
              display: 'flex',
              width: '100%',
              alignSelf: 'flex-end',
              backgroundColor: Theme.colors.player.background,
              borderTopLeftRadius: 30,
              borderTopRightRadius: 30,
              paddingBottom: insets.bottom
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'stretch',
                justifyContent: 'space-between',
                margin: 20,
                marginHorizontal: 30,
                marginBottom: 40
              }}
            >
              <Text style={Theme.palette.subhead4}>{title}</Text>
              <TouchableOpacity
                style={{ justifyContent: 'center', alignItems: 'center' }}
                onPress={close}
              >
                <Image source={Theme.images.modal.close} />
              </TouchableOpacity>
            </View>

            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const OptionsModal = ({
  title,
  subtitle,
  icon,
  show,
  close,
  children
}: {
  title: string,
  subtitle: string,
  icon: string,
  show: boolean,
  close: any,
  children: any
}) => {
  return (
    <Modal animationType="slide" transparent visible={show} onRequestClose={close}>
      <View
        style={{
          flex: 1,
          backgroundColor: Theme.colors.modal.background,
          flexDirection: 'column-reverse'
        }}
      >
        <TouchableOpacity onPress={close} style={DecisionModalStyles.closeButton}>
          <Text style={Theme.palette.closeText}>{t('modal.close')}</Text>
        </TouchableOpacity>
        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'stretch',
              display: 'flex',
              width: '82%',
              alignSelf: 'flex-end',
              backgroundColor: Theme.colors.player.background,
              borderRadius: 30,
              paddingBottom: 15
            }}
          >
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'stretch',
                justifyContent: 'center',
                marginTop: 30,
                marginHorizontal: 32,
                marginBottom: 14
              }}
            >
              <Image source={icon} style={{ marginHorizontal: 17 }} />
              <View style={{ flexDirection: 'column', flex: 1, alignItems: 'flex-start' }}>
                <Text style={Theme.palette.h4}>{title}</Text>
                <Text style={Theme.palette.h7}>{subtitle}</Text>
              </View>
            </View>

            {children}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const Option = ({ title, icon, onPress }: { title: string, icon: string, onPress: any }) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ width: '100%', justifyContent: 'center', height: 46 }}
    >
      <View
        style={{
          alignItems: 'center',
          flexDirection: 'row',
          marginHorizontal: 32,
          justifyContent: 'space-between'
        }}
      >
        <Text style={Theme.palette.h6}>{title}</Text>
        <Image source={icon} />
      </View>
    </TouchableOpacity>
  );
};

export const LoginModal = ({ close, show }: { close: any, show: boolean }) => {
  const navigation = useNavigation();

  function navigateAndClose() {
    navigation.navigate('SignIn');
    close(true);
  }

  return (
    <Modal animationType="slide" onRequestClose={close} transparent visible={show}>
      <View
        style={{
          flex: 1,
          backgroundColor: Theme.colors.modal.background,
          flexDirection: 'column-reverse'
        }}
      >
        <View style={{ flexDirection: 'row', alignSelf: 'center' }}>
          <View
            style={{
              flexDirection: 'column',
              justifyContent: 'flex-start',
              alignItems: 'stretch',
              display: 'flex',
              width: '100%',
              alignSelf: 'flex-end',
              backgroundColor: Theme.colors.player.background,
              borderRadius: 30,
              paddingBottom: 15
            }}
          >
            <View
              style={{
                flexDirection: 'row-reverse',
                justifyContent: 'space-between',
                marginHorizontal: 30,
                marginVertical: 13,
                alignItems: 'center'
              }}
            >
              <TouchableOpacity onPress={close}>
                <Image source={Theme.images.closeX} />
              </TouchableOpacity>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginHorizontal: 30,
                marginVertical: 13,
                alignItems: 'center'
              }}
            >
              <Text style={Theme.palette.h8}>{t('modal.login')}</Text>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                marginHorizontal: 30,
                marginVertical: 13,
                alignItems: 'center'
              }}
            >
              <TouchableOpacity
                onPress={navigateAndClose}
                style={{
                  height: 50,
                  width: '80%',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderRadius: 12,
                  backgroundColor: Theme.colors.button,
                  marginLeft: 32,
                  marginRight: 32,
                  marginTop: 24,
                  marginBottom: 12,
                  flexDirection: 'row',
                  alignSelf: 'center'
                }}
              >
                <Text style={Theme.palette.closeText}>{t('loginModal.login')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const ShareModal = ({ show, close, item }: { show: boolean, close: any, item: any }) => {
  const navigation = useNavigation();
  const { setItem } = useContext(Context);

  return (
    <Modal animationType="slide" transparent visible={show} onRequestClose={close}>
      <View style={{ ...styles.shareModalBackground }}>
        <View style={{ ...styles.shareModalView }}>
          <View style={{ ...styles.shareModalContainer }}>
            <View style={{ ...styles.shareModalHeader }}>
              <Text style={Theme.palette.h8}>{t('options.shared.shareOthers')}</Text>
              <TouchableOpacity onPress={close}>
                <Image source={Theme.images.closeX} />
              </TouchableOpacity>
            </View>
            <Image source={Theme.images.share.image} style={{ ...styles.shareModalImage }} />
            <ScrollView>
              <TouchableOpacity
                style={{ ...styles.shareModalItemContainer }}
                onPress={() => {
                  Share.shareSingle({
                    url: item.url,
                    social: Share.Social.FACEBOOK
                  });
                }}
              >
                <View style={{ ...styles.shareModalItemLabelContainer }}>
                  <Image
                    source={Theme.images.share.facebook}
                    style={{ ...styles.shareModalItemLabelImage }}
                  />
                  <Text style={Theme.palette.h9}>{t('shareModal.facebook')}</Text>
                </View>
                <Image source={Theme.images.right} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ ...styles.shareModalItemContainer }}
                onPress={() => {
                  Share.shareSingle({
                    url: item.url,
                    social: Share.Social.TWITTER
                  });
                }}
              >
                <View style={{ ...styles.shareModalItemLabelContainer }}>
                  <Image
                    source={Theme.images.share.twitter}
                    style={{ ...styles.shareModalItemLabelImage }}
                  />
                  <Text style={Theme.palette.h9}>{t('shareModal.twitter')}</Text>
                </View>
                <Image source={Theme.images.right} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ ...styles.shareModalItemContainer }}
                onPress={() => {
                  Share.shareSingle({
                    url: item.url,
                    message: item.url,
                    social: Share.Social.WHATSAPP,
                    whatsAppNumber: '',
                  });
                }}
              >
                <View style={{ ...styles.shareModalItemLabelContainer }}>
                  <Image
                    source={Theme.images.share.whatsApp}
                    style={{ ...styles.shareModalItemLabelImage }}
                  />
                  <Text style={Theme.palette.h9}>{t('shareModal.whatsapp')}</Text>
                </View>
                <Image source={Theme.images.right} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ ...styles.shareModalItemContainer }}
                onPress={() => Clipboard.setString(item.url)}
              >
                <View style={{ ...styles.shareModalItemLabelContainer }}>
                  <Image
                    source={Theme.images.share.copyLink}
                    style={{ ...styles.shareModalItemLabelImage }}
                  />
                  <Text style={Theme.palette.h9}>{t('options.shared.copy')}</Text>
                </View>
                <Image source={Theme.images.right} />
              </TouchableOpacity>
              <TouchableOpacity
                style={{ ...styles.shareModalMoreItemContainer }}
                onPress={() => {
                  if (Platform.OS === 'ios') {
                    Share.open({ url: item.url });
                  } else {
                    setItem(item);
                    navigation.navigate('P2PSharing');
                    close();
                  }
                }}
              >
                <View style={{ ...styles.shareModalItemLabelContainer }}>
                  <Image
                    source={Theme.images.more}
                    style={{ ...styles.shareModalMoreItemLabelImage }}
                  />
                  <Text style={Theme.palette.h9}>{t('options.shared.more')}</Text>
                </View>
                <Image source={Theme.images.right} />
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );
};

export const DownloadModal = ({
  show,
  close,
  track
}: {
  show: boolean,
  close: any,
  track: Audio
}) => {
  const { addTrack, downloading, progress } = useDownloads();
  useEffect(() => {
    if (track && show) {
      addTrack(track);
    }
    // eslint-disable-next-line
  }, [track, show]);
  return (
    <Modal animationType="slide" transparent visible={show} onRequestClose={close}>
      <View
        style={{
          flex: 1,
          backgroundColor: Theme.colors.background,
          flexDirection: 'column-reverse',
          alignItems: 'center'
        }}
      >
        <TouchableOpacity
          onPress={close}
          style={{
            height: 50,
            width: '80%',
            justifyContent: 'center',
            alignItems: 'center',
            borderRadius: 12,
            backgroundColor: Theme.colors.button,
            marginLeft: 32,
            marginRight: 32,
            marginTop: 150,
            marginBottom: 34,
            flexDirection: 'row',
            alignSelf: 'center'
          }}
        >
          <Text style={Theme.palette.closeText}>{t('modal.close')}</Text>
        </TouchableOpacity>
        <View
          style={{
            padding: 55
          }}
        >
          <Progress.Bar
            color={downloading ? '#006FA1' : '#34AA44'}
            unfilledColor="#F0F2FF"
            borderColor="#ffffff00"
            progress={downloading ? progress / 100 : 1}
            width={350}
          />
        </View>
        <Text style={Theme.palette.h2}>
          {downloading ? t('downloadModal.downloading') : t('downloadModal.complete')}
        </Text>
        <View
          style={{
            marginBottom: 55,
            backgroundColor: 'white',
            width: 100,
            borderRadius: 50,
            height: 100,
            justifyContent: 'center',
            alignItems: 'center'
          }}
        >
          <Image source={downloading ? Theme.images.downloading : Theme.images.downloadComplete} />
        </View>
      </View>
    </Modal>
  );
};
