package com.ttb.android.bluetooth.rn_bridge;
import com.facebook.react.common.MapBuilder;
import com.facebook.react.uimanager.SimpleViewManager;
import com.facebook.react.uimanager.ThemedReactContext;
import com.facebook.react.uimanager.annotations.ReactProp;
import com.ttb.android.bluetooth.BluetoothShareView;

import java.util.Map;

import javax.annotation.Nullable;


public class BluetoothShareManager extends SimpleViewManager<BluetoothShareView> {
    public static final String REACT_CLASS = "BluetoothShareView";

    @Override
    public String getName() {
        return REACT_CLASS;
    }

    @Override
    public BluetoothShareView createViewInstance(ThemedReactContext ctx) {
        return new BluetoothShareView(ctx);
    }

    @ReactProp(name = "title")
    public void setTitle(BluetoothShareView postPreview, @Nullable String title) {

    }

    @Override
    public Map getExportedCustomBubblingEventTypeConstants() {
        MapBuilder.Builder builder =  MapBuilder.builder();
        return builder.build();
    }
}

