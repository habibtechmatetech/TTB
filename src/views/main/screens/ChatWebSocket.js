/* flow */

import moment from 'moment';
import React, { useRef, useState } from 'react';
import { Image, View, FlatList, Text, TouchableOpacity } from 'react-native';
import SockJsClient from 'react-stomp';
import EStyleSheet from 'react-native-extended-stylesheet';
import Constants from 'TTB/src/constants';
import Theme from 'TTB/src/theme/Theme';
import { useStore } from 'TTB/src/model/root';
import { Tooltip } from 'react-native-elements';
import { t } from 'TTB/src/services/i18n';
import colors from '../../../theme/colors';
import AuthManager from '../../../services/auth';

const styles = EStyleSheet.create({
  content: {},
  viewWrapItemRight: {
    flex: 1,
    backgroundColor: '#006FA1',
    borderRadius: 20,
    zIndex: 0,
    marginRight: 25
  },
  viewWrapItemLeft: {
    backgroundColor: '#FFFFFF',
    flex: 1,
    borderRadius: 20,
    zIndex: 0,
    marginLeft: 25
  },
  textItemRight: {
    fontFamily: 'Noto Sans',
    fontSize: 12,
    lineHeight: 20,
    color: '#FFFFFF',
    paddingHorizontal: 30,
    paddingVertical: 15
  },
  textItemLeft: {
    fontFamily: 'Noto Sans',
    fontSize: 12,
    lineHeight: 20,
    color: '#2A324B',
    paddingHorizontal: 30,
    paddingVertical: 15
  },
  textItemSystem: {
    fontFamily: 'NotoSans-Italic',
    fontSize: 12,
    lineHeight: 20,
    color: '#2A324B',
    textAlign: 'center'
  },
  iconRight: {
    position: 'absolute',
    zIndex: 20,
    right: 0
  },
  iconLeft: {
    position: 'absolute',
    zIndex: 20,
    left: 0
  },
  topTiming: {
    borderBottomColor: '#9B9B9B',
    borderBottomWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  displayTime: {
    position: 'absolute',
    backgroundColor: colors.background,
    paddingHorizontal: 10
  },
  messageContainerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingRight: 20,
    paddingVertical: 20
  },
  messageContainerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingLeft: 20,
    paddingVertical: 20
  },
  systemMessageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20
  }
});

const SystemMessage = ({ item }: { item: any }) => {
  return (
    <TouchableOpacity onPress={item.action} style={styles.systemMessageContainer}>
      <Text style={styles.textItemSystem}>{item.content}</Text>
    </TouchableOpacity>
  );
};

const DisplayMessageRight = ({
  item,
  client,
  isOwner
}: {
  item: any,
  client: any,
  isOwner: boolean
}) => {
  const tooltipRef = useRef(null);
  return (
    <View style={styles.messageContainerRight}>
      {isOwner && (
        <Tooltip
          ref={tooltipRef}
          containerStyle={{
            shadowColor: '#000000',
            shadowOffset: {
              width: 0,
              height: 10
            },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 5
          }}
          backgroundColor="#FFFFFF"
          withOverlay={false}
          withPointer={false}
          popover={
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
              onPress={() => {
                client.current.sendMessage(JSON.stringify({ type: 'deleteMessage', id: item.id }));
              }}
            >
              <Text
                style={{
                  fontFamily: 'NotoSans-SemiBold',
                  fontSize: 12,
                  color: '#FC5A5A',
                  marginRight: 20
                }}
              >
                {t('groups.chat.deletePost')}
              </Text>
              <Image source={Theme.images.trash} />
            </TouchableOpacity>
          }
        >
          <Image
            resizeMode="center"
            style={{ width: 42, height: 42 }}
            source={Theme.images.moreVertical}
          />
        </Tooltip>
      )}
      <View style={styles.viewWrapItemRight}>
        <Text style={styles.textItemRight}>{item.content}</Text>
      </View>
      <View style={{ zIndex: 20 }}>
        <Image source={Theme.images.defaultIcon} style={styles.iconRight} />
      </View>
    </View>
  );
};

const DisplayMessageLeft = ({
  item,
  client,
  isOwner
}: {
  item: any,
  client: any,
  isOwner: boolean
}) => {
  const tooltipRef = useRef(null);

  return (
    <View style={styles.messageContainerLeft}>
      <View style={{ zIndex: 20 }}>
        <Image source={Theme.images.defaultIcon} style={styles.iconLeft} />
      </View>
      <View style={styles.viewWrapItemLeft}>
        <Text style={styles.textItemLeft}>{item.content}</Text>
      </View>
      {isOwner && (
        <Tooltip
          ref={tooltipRef}
          containerStyle={{
            shadowColor: '#000000',
            shadowOffset: {
              width: 0,
              height: 10
            },
            shadowOpacity: 0.1,
            shadowRadius: 20,
            elevation: 5
          }}
          backgroundColor="#FFFFFF"
          withOverlay={false}
          withPointer={false}
          popover={
            <TouchableOpacity
              style={{ flexDirection: 'row' }}
              onPress={() => {
                client.current.sendMessage(JSON.stringify({ type: 'deleteMessage', id: item.id }));
              }}
            >
              <Text
                style={{
                  fontFamily: 'NotoSans-SemiBold',
                  fontSize: 12,
                  color: '#FC5A5A',
                  marginRight: 20
                }}
              >
                {t('groups.chat.deletePost')}
              </Text>
              <Image source={Theme.images.trash} />
            </TouchableOpacity>
          }
        >
          <Image
            resizeMode="center"
            style={{ width: 42, height: 42 }}
            source={Theme.images.moreVertical}
          />
        </Tooltip>
      )}
    </View>
  );
};

type Message = {
  content: string,
  messageType:
    | 'systemMessage'
    | 'message'
    | 'deleteMessage'
    | 'endDevotion'
    | 'startDevotion'
    | 'updateAudio',
  action: any
};

const ChatWebSocket = React.forwardRef(
  (
    {
      group,
      onClose,
      refresh,
      initialMessage
    }: { group: any, initialMessage: Message, onClose: () => void, refresh: () => void },
    ref
  ) => {
    const { uiState } = useStore();
    const userEmail = uiState.user.email;
    const headers = { Authorization: `Bearer ${AuthManager.tokenCredentials}` };
    const [messages, setMessages] = useState([]);
    const client = useRef({
      connection: null,
      sendMessage: (message, topic: string = 'discussion') => {
        if (client.current.connection) {
          client.current.connection.sendMessage(`/${topic}/${group.id}`, message, { ...headers });
        }
      }
    });
    const list = useRef();

    const isOwner = uiState.user.id === group.owner;
    let mins = 0;

    return (
      <View>
        <SockJsClient
          url={`${Constants.REST_API_URL_USERS}/discussion`}
          headers={headers}
          subscribeHeaders={headers}
          topics={[`/topic/${group.id}`, `/events/${group.id}`]}
          onConnect={() => {}}
          onDisconnect={() => {}}
          onConnectFailure={error => {
            // eslint-disable-next-line no-console
            console.log(error);
          }}
          onMessage={message => {
            if (!message) {
              return;
            }
            if (message.type === 'message' || message.type === 'systemMessage') {
              setMessages([...messages, message]);
            }
            if (message.type === 'deleteMessage') {
              const systemMessage = {
                type: 'systemMessage',
                content: `${message.username} ${t('groups.chat.deleteMessage')}`,
                action: () => {
                  onClose();
                }
              };
              setMessages(messages.map(m => (m.id === message.id ? systemMessage : m)));
            }
            if (message.type === 'endDevotion' && !isOwner) {
              const systemMessage = {
                type: 'systemMessage',
                content: message.username
                  ? `${message.username} ${t('chat.settings.endDevotion.endDevotionLabel')}`
                  : t('chat.settings.endDevotion.hasEnded'),
                action: () => {
                  onClose();
                }
              };
              setMessages([...messages, systemMessage]);
              refresh();
            }
            if (message.type === 'updateAudio' && !isOwner) {
              refresh();
            }
            if (message.type === 'userDirectoryUpdate' && !isOwner) {
              if (message.content.includes(uiState.user.id)) {
                onClose();
              }
            }
          }}
          ref={socketClient => {
            client.current.connection = socketClient;
            // eslint-disable-next-line no-param-reassign
            ref.current = client.current;
          }}
        />
        <FlatList
          style={styles.content}
          data={[initialMessage, ...messages]}
          keyExtractor={(item, index) => {
            return item.id || `${index}`;
          }}
          ref={list}
          renderItem={({ item, index }) => {
            let showTime = false;

            if (item.type === 'systemMessage') {
              return <SystemMessage item={item} />;
            }

            // Message right
            if (item.username === userEmail) {
              if (messages.length > 1) {
                const previousMessage = messages[index - 1];
                if (previousMessage) {
                  mins = parseInt(
                    moment
                      .utc(
                        moment(item.timestamp, 'HH:mm').diff(
                          moment(previousMessage.timestamp, 'HH:mm')
                        )
                      )
                      .format('mm'),
                    10
                  );
                }
                if (mins >= 1) {
                  showTime = true;
                }
              }
              return showTime ? (
                <View style={{ flexDirection: 'column', marginTop: 20 }}>
                  <View style={styles.topTiming}>
                    <Text style={styles.displayTime}>
                      {moment(item.timestamp).format('dddd, h:mm a')}
                    </Text>
                  </View>
                  <DisplayMessageRight
                    item={item}
                    client={client}
                    isOwner={isOwner || item.username === userEmail}
                    groupId={group.id}
                  />
                </View>
              ) : (
                <DisplayMessageRight
                  item={item}
                  client={client}
                  isOwner={isOwner || item.username === userEmail}
                  groupId={group.id}
                />
              );
            }
            // Message left
            return showTime ? (
              <View style={{ flexDirection: 'column', marginTop: 20 }}>
                <View style={styles.topTiming}>
                  <Text style={styles.displayTime}>
                    {moment(item.timestamp).format('dddd, h:mm:ss a')}
                  </Text>
                </View>
                <DisplayMessageLeft
                  item={item}
                  client={client}
                  isOwner={isOwner || item.username === userEmail}
                  groupId={group.id}
                />
              </View>
            ) : (
              <DisplayMessageLeft
                item={item}
                client={client}
                isOwner={isOwner || item.username === userEmail}
                groupId={group.id}
              />
            );
          }}
          contentContainerStyle={{ paddingTop: 10, paddingBottom: 10 }}
          onContentSizeChange={() => list.current.scrollToEnd()}
        />
      </View>
    );
  }
);

export default ChatWebSocket;
