package com.ttb.android.p2p;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.net.Uri;
import android.net.wifi.WpsInfo;
import android.net.wifi.p2p.WifiP2pConfig;
import android.net.wifi.p2p.WifiP2pDeviceList;
import android.net.wifi.p2p.WifiP2pGroup;
import android.net.wifi.p2p.WifiP2pInfo;
import android.net.wifi.p2p.WifiP2pManager;
import android.net.wifi.p2p.WifiP2pManager.PeerListListener;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.LifecycleEventListener;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.koushikdutta.async.ByteBufferList;
import com.koushikdutta.async.DataEmitter;
import com.koushikdutta.async.callback.CompletedCallback;
import com.koushikdutta.async.callback.DataCallback;
import com.koushikdutta.async.http.AsyncHttpClient;
import com.koushikdutta.async.http.WebSocket;
import com.koushikdutta.async.http.server.AsyncHttpServer;
import com.koushikdutta.async.AsyncServer;
import com.koushikdutta.async.http.server.AsyncHttpServerRequest;


import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.util.ArrayList;

import static android.os.Looper.getMainLooper;

/**
 * Created by zyusk on 01.05.2018.
 */
public class WiFiP2PManagerModule extends ReactContextBaseJavaModule implements WifiP2pManager.ConnectionInfoListener, LifecycleEventListener {
    private WifiP2pInfo wifiP2pInfo;
    private WifiP2pManager manager;
    private WifiP2pManager.Channel channel;
    private WiFiP2PBroadcastReceiver receiver;
    private ReactApplicationContext reactContext;
    private final IntentFilter intentFilter = new IntentFilter();
    private WiFiP2PDeviceMapper mapper = new WiFiP2PDeviceMapper();
    private ArrayList<WebSocket> sockets = new ArrayList<>();
    private AsyncHttpServer httpServer = new AsyncHttpServer();
    private WebSocket socket;
    private File file = null;
    private FileOutputStream fileOutputStream = null;

    public WiFiP2PManagerModule(ReactApplicationContext reactContext) {
        super(reactContext);

        this.reactContext = reactContext;
        this.reactContext.addLifecycleEventListener(this);

        httpServer.listen(new AsyncServer(), 8090);

        httpServer.websocket("/", new AsyncHttpServer.WebSocketRequestCallback() {
            @Override
            public void onConnected(final WebSocket webSocket, AsyncHttpServerRequest request) {
                sockets.add(webSocket);

                //Use this to clean up any references to your websocket
                webSocket.setClosedCallback(new CompletedCallback() {
                    @Override
                    public void onCompleted(Exception ex) {
                        try {
                            if (ex != null)
                                Log.e("WebSocket", "An error occurred", ex);
                        } finally {
                            sockets.remove(webSocket);
                        }
                    }
                });

                webSocket.setStringCallback(new WebSocket.StringCallback() {
                    @Override
                    public void onStringAvailable(String s) {
                        for (WebSocket socket : sockets) {
                            if (socket.equals(webSocket)) {
                                continue;
                            }
                            socket.send(s);
                        }
                    }
                });

                webSocket.setDataCallback((emitter, bb) -> {
                    for (WebSocket socket : sockets) {
                        if (socket.equals(webSocket)) {
                            continue;
                        }
                        socket.send(bb.getAllByteArray());
                    }
                });

            }
        });


    }

    @Override
    public String getName() {
        return "WiFiP2PManagerModule";
    }

    @Override
    public void onConnectionInfoAvailable(WifiP2pInfo info) {
        this.wifiP2pInfo = info;
    }

    @Override
    public void onHostResume() {
        if (receiver != null) {
            Activity activity = getCurrentActivity();
            activity.registerReceiver(receiver, intentFilter);
            manager.discoverPeers(channel, null);
        }
    }

    @Override
    public void onHostPause() {
        if (receiver != null) {
            Activity activity = getCurrentActivity();
           activity.unregisterReceiver(receiver);
        }

    }

    @Override
    public void onHostDestroy() {
        if (receiver != null) {
            Activity activity = getCurrentActivity();
            activity.unregisterReceiver(receiver);
        }
        if (socket != null) {
            socket.close();
        }
        if (httpServer != null) {
            httpServer.stop();
            httpServer = null;
        }
    }

    @ReactMethod
    public void init() {
        if (manager != null) { // prevent reinitialization
            return;
        }

        intentFilter.addAction(WifiP2pManager.WIFI_P2P_STATE_CHANGED_ACTION);
        intentFilter.addAction(WifiP2pManager.WIFI_P2P_PEERS_CHANGED_ACTION);
        intentFilter.addAction(WifiP2pManager.WIFI_P2P_CONNECTION_CHANGED_ACTION);
        intentFilter.addAction(WifiP2pManager.WIFI_P2P_THIS_DEVICE_CHANGED_ACTION);

        Activity activity = getCurrentActivity();
        if (activity != null) {
            manager = (WifiP2pManager) activity.getSystemService(Context.WIFI_P2P_SERVICE);
            if (manager != null) {
                channel = manager.initialize(activity, getMainLooper(), null);
                receiver = new WiFiP2PBroadcastReceiver(manager, channel, reactContext);
                activity.registerReceiver(receiver, intentFilter);
            }
        }
    }

    public interface ResultHandler<T> {
        void onSuccess();

        void onFailure(Exception e);
    }

    private void initializeSocket(WifiP2pInfo info, ResultHandler completion) {
        if (socket != null) {
            completion.onSuccess();
            return;
        }

        System.out.println("INITIALIZING SOCKET CONNECTION");
        AsyncHttpClient.getDefaultInstance().websocket("http://" + info.groupOwnerAddress.getHostAddress() + ":8090", null, new AsyncHttpClient.WebSocketConnectCallback() {
            @Override
            public void onCompleted(Exception ex, WebSocket webSocket) {
                if (ex != null) {
                    System.out.println("CONNECTION TO SERVER FAILED");
                    ex.printStackTrace();
                    completion.onFailure(ex);
                    return;
                }
                System.out.println("CONNECTION TO SERVER SUCCESSFUL");
                socket = webSocket;
                completion.onSuccess();
            }
        });
    }

    @ReactMethod
    public void getConnectionInfo(final Promise promise) {
        manager.requestConnectionInfo(channel, new WifiP2pManager.ConnectionInfoListener() {
            @Override
            public void onConnectionInfoAvailable(WifiP2pInfo wifiP2pInformation) {
                System.out.println(wifiP2pInformation);

                wifiP2pInfo = wifiP2pInformation;

                promise.resolve(mapper.mapWiFiP2PInfoToReactEntity(wifiP2pInformation));

                initializeSocket(wifiP2pInformation, new ResultHandler() {
                    @Override
                    public void onSuccess() {
                        socket.setStringCallback(s -> {
                            if (s.equals("CLOSE_FILE")) {
                                WritableMap payload = Arguments.createMap();
                                try {
                                    fileOutputStream.close();
                                    payload.putString("message", s);
                                    payload.putString("uri", Uri.fromFile(file).toString());
                                    System.out.println("DONE DOWNLOADING file " + file.toString());
                                    file = null;
                                    fileOutputStream = null;
                                } catch (IOException e) {
                                    System.err.println(e.getMessage());
                                    payload.putInt("error", 2);
                                }
                                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("WIFI_P2P:RECEIVE_FILE", payload);
                            } else {
                                WritableMap payload = Arguments.createMap();
                                payload.putString("message", s);
                                reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("WIFI_P2P:RECEIVE_MESSAGE", payload);
                            }
                        });
                        socket.setDataCallback(new DataCallback() {
                            @Override
                            public void onDataAvailable(DataEmitter emitter, ByteBufferList bb) {
                                try {
                                    if (file == null) {
                                        file = new File(getCurrentActivity().getFilesDir() + "/temp_file");
                                        file.createNewFile();
                                        fileOutputStream = new FileOutputStream(file);
                                    }
                                    ByteBufferList.writeOutputStream(fileOutputStream, bb.getAll());
                                } catch (IOException e) {
                                    System.err.println(e.getMessage());
                                    WritableMap payload = Arguments.createMap();
                                    payload.putInt("error", 2);
                                    reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("WIFI_P2P:RECEIVE_FILE", payload);
                                }
                            }
                        });
                    }

                    @Override
                    public void onFailure(Exception e) {

                    }
                });

            }
        });
    }

    @ReactMethod
    public void getGroupPassphraseInfo(final Promise promise) {
        manager.requestGroupInfo(channel, new WifiP2pManager.GroupInfoListener() {
            @Override
            public void onGroupInfoAvailable(WifiP2pGroup group) {
                if (group != null) {
                    String groupPassword = group.getPassphrase();
                    promise.resolve(groupPassword);
                } else {
                    promise.resolve(null);
                }
            }
        });
    }

    @ReactMethod
    public void isSuccessfulInitialize(Promise promise) {
        Boolean isSuccessfulInitialize = manager != null && channel != null;
        if (isSuccessfulInitialize) {
            promise.resolve(isSuccessfulInitialize);
        } else {
            promise.reject("Failed", "Initialization was not successful");
        }
    }

    @ReactMethod
    public void createGroup(final Callback callback) {
        manager.createGroup(channel, new WifiP2pManager.ActionListener() {
            public void onSuccess() {
                callback.invoke();
                //Group creation successful
            }

            public void onFailure(int reason) {
                callback.invoke(Integer.valueOf(reason));
                //Group creation failed
            }
        });
    }

    @ReactMethod
    public void removeGroup(final Callback callback) {
        manager.removeGroup(channel, new WifiP2pManager.ActionListener() {
            @Override
            public void onSuccess() {
                callback.invoke();
            }

            @Override
            public void onFailure(int reason) {
                callback.invoke(Integer.valueOf(reason));
            }
        });
    }

    @ReactMethod
    public void getAvailablePeersList(final Promise promise) {
        manager.requestPeers(channel, new PeerListListener() {
            @Override
            public void onPeersAvailable(WifiP2pDeviceList deviceList) {
                WritableMap params = mapper.mapDevicesInfoToReactEntity(deviceList);
                promise.resolve(params);
            }
        });
    }

    @ReactMethod
    public void discoverPeers(final Callback callback) {
        manager.discoverPeers(channel, new WifiP2pManager.ActionListener() {
            @Override
            public void onSuccess() {
                callback.invoke();
            }

            @Override
            public void onFailure(int reasonCode) {
                callback.invoke(Integer.valueOf(reasonCode));
            }
        });
    }

    @ReactMethod
    public void stopPeerDiscovery(final Callback callback) {
        if (manager == null) {
            callback.invoke();
            return;
        }
        manager.stopPeerDiscovery(channel, new WifiP2pManager.ActionListener() {
            @Override
            public void onSuccess() {
                callback.invoke();
            }

            @Override
            public void onFailure(int reasonCode) {
                callback.invoke(Integer.valueOf(reasonCode));
            }
        });
    }

    @ReactMethod
    public void disconnect(final Callback callback) {
        manager.cancelConnect(channel, new WifiP2pManager.ActionListener() {
            @Override
            public void onSuccess() {
                callback.invoke();
            }

            @Override
            public void onFailure(int reasonCode) {
                callback.invoke(Integer.valueOf(reasonCode));
            }
        });
    }

    @ReactMethod
    public void connect(String deviceAddress, final Callback callback) {
        WifiP2pConfig config = new WifiP2pConfig();
        config.deviceAddress = deviceAddress;
        config.wps.setup = WpsInfo.PBC;

        manager.connect(channel, config, new WifiP2pManager.ActionListener() {
            @Override
            public void onSuccess() {
                callback.invoke();
            }

            @Override
            public void onFailure(int reasonCode) {
                callback.invoke(Integer.valueOf(reasonCode));
            }
        });
    }

    @ReactMethod
    public void sendFile(String filePath, Callback callback) {
        manager.requestConnectionInfo(channel, new WifiP2pManager.ConnectionInfoListener() {
            @Override
            public void onConnectionInfoAvailable(WifiP2pInfo info) {
                initializeSocket(info, new ResultHandler() {
                    @Override
                    public void onSuccess() {
                        new FileClientAsyncTask(getCurrentActivity(), socket, filePath, callback)
                                .execute();
                    }

                    @Override
                    public void onFailure(Exception e) {

                    }
                });
            }
        });
    }

    @ReactMethod
    public void sendMessage(String message, Callback callback) {
        manager.requestConnectionInfo(channel, new WifiP2pManager.ConnectionInfoListener() {
            @Override
            public void onConnectionInfoAvailable(WifiP2pInfo info) {
                initializeSocket(info, new ResultHandler() {
                    @Override
                    public void onSuccess() {
                        socket.send(message);
                        callback.invoke();
                    }

                    @Override
                    public void onFailure(Exception e) {

                    }
                });


            }
        });
    }

}
