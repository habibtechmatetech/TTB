package com.ttb.android;

import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.view.ViewGroup;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactRootView;
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;
import com.ttb.android.bluetooth.BluetoothShareView;
import com.ttb.android.bluetooth.interfaces.SelectedFileListener;

import com.facebook.react.GoogleCastActivity;


public class MainActivity extends GoogleCastActivity {
  private final static String TAG = MainActivity.class.getSimpleName();
  private static final int REQ_FILE_SELECTION = 19001;
  private static MainActivity mActivity;
  private SelectedFileListener selectedFileListener;
  @Override
  protected String getMainComponentName() {
    return "TTB";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegate(this, getMainComponentName()) {
      @Override
      protected ReactRootView createRootView() {
       return new RNGestureHandlerEnabledRootView(MainActivity.this);
      }
    };
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(savedInstanceState);
    mActivity = this;
  }

  @Override
  protected void onResume() {
    super.onResume();
    if (BuildConfig.DEBUG && BuildConfig.FLAVOR.equals("dev_bluetooth")) {
      BluetoothShareView view = new BluetoothShareView(this);
      ViewGroup.LayoutParams params = new ViewGroup.LayoutParams(
          ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT);
      addContentView(view, params);
    }
  }

  public static MainActivity getInstance(){
    return mActivity;
  }

  public void openFileSelection(SelectedFileListener listener) {
    selectedFileListener = listener;
    Intent mediaIntent = new Intent(Intent.ACTION_GET_CONTENT);
    mediaIntent.setType("*/*"); //set mime type as per requirement
    startActivityForResult(mediaIntent, REQ_FILE_SELECTION);
  }

  @Override
  public void onActivityResult(int requestCode, int resultCode, Intent data) {
    super.onActivityResult(requestCode, resultCode, data);
    if (requestCode == REQ_FILE_SELECTION && resultCode == RESULT_OK) {
      Uri uriPath = data.getData();
      Log.d(TAG, " URI= " + uriPath);
      if (selectedFileListener != null) {
        selectedFileListener.onSelectedFile(uriPath);
      }
    }
  }
}
