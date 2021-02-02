package com.ttb.android.bluetooth;

import android.bluetooth.BluetoothAdapter;
import android.content.ComponentName;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.content.pm.ResolveInfo;
import android.net.Uri;
import android.util.AttributeSet;
import android.view.Choreographer;
import android.view.LayoutInflater;
import android.view.View;
import android.widget.Button;
import android.widget.Toast;

import androidx.constraintlayout.widget.ConstraintLayout;

import com.ttb.android.MainActivity;
import com.ttb.android.R;
import com.ttb.android.bluetooth.interfaces.SelectedFileListener;
import com.ttb.android.utils.UIUtils;

import java.io.File;
import java.util.List;

public class BluetoothShareView extends ConstraintLayout implements View.OnClickListener {

    private static final String TAG = "BluetoothShareView";
    Button btnShare;

    //region ---------- Check/Open Bluetooth setting ----------------

    @Override
    public void onClick(View v) {
        if (v.getId() == R.id.btnShare) {
            if (isBluetoothSupported()) {
                if (!isBluetoothOn()) {
                    enableBluetooth();
                } else {
                    MainActivity.getInstance().
                        openFileSelection((Uri uri) -> openShareFileBluetooth(uri));
                }
            }
        }
    }

    private boolean isBluetoothSupported() {
        BluetoothAdapter bluetoothAdapter = BluetoothAdapter.getDefaultAdapter();
        if (bluetoothAdapter == null) {
            //not supported
            UIUtils.showWaring(getContext(), "",
                getContext().getResources().getString(R.string.err_bluetooth_not_supported), null);
            return false;
        } else {
            //bluetooth supported
            return true;
        }
    }
    private boolean isBluetoothOn() {
        if (BluetoothAdapter.getDefaultAdapter().isEnabled()) {
            return true;
        }
        return false;
    }

    private void openBluetoothSetting() {
        final Intent intent = new Intent(Intent.ACTION_MAIN, null);
        intent.addCategory(Intent.CATEGORY_LAUNCHER);
        ComponentName cn = new ComponentName("com.android.settings",
            "com.android.settings.bluetooth.BluetoothSettings");
        intent.setComponent(cn);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        getContext().startActivity(intent);
    }

    public void enableBluetooth(){
        Intent bluetoothIntent = new Intent(BluetoothAdapter.ACTION_REQUEST_ENABLE);
        getContext().startActivity(bluetoothIntent);
    }

    public void disableBluetooth(){
        BluetoothAdapter.getDefaultAdapter().disable();
    }

    //endregion

    //region ---------- Share file via Bluetooth ---------

    private void openShareFileBluetooth(Uri uri) {
        Intent sharingIntent = new Intent(Intent.ACTION_SEND);
        sharingIntent.setType("*/*");
        sharingIntent.setPackage("com.android.bluetooth");
        sharingIntent.putExtra(Intent.EXTRA_STREAM, uri);
        getContext().startActivity(Intent.createChooser(sharingIntent, "Share file"));
    }
    private void shareFileViaBluetooth(String path) {
        Intent intent = new Intent();
        intent.setAction(Intent.ACTION_SEND);
        intent.setType("*/*");

        File f = new File(path);
        intent.putExtra(Intent.EXTRA_STREAM, Uri.fromFile(f));

        PackageManager pm = getContext().getPackageManager();
        List<ResolveInfo> appsList = pm.queryIntentActivities(intent, 0);

        if (appsList.size() > 0) {
            String packageName = null;
            String className = null;
            boolean found = false;

            for (ResolveInfo info : appsList) {
                packageName = info.activityInfo.packageName;
                if (packageName.equals("com.android.bluetooth")) {
                    className = info.activityInfo.name;
                    found = true;
                    break;
                }
            }

            if (!found) {
                Toast.makeText(getContext(), "Bluetooth havn't been found", Toast.LENGTH_LONG).show();
            } else {
                intent.setClassName(packageName, className);
                getContext().startActivity(intent);
            }
        }
    }
    //endregion

    //region ---------- Initialize ----------------


    @Override
    protected void onAttachedToWindow() {
        super.onAttachedToWindow();

    }

    public void initView(Context context, AttributeSet attrs, int defStyleAttr) {
        LayoutInflater inflater = (LayoutInflater)context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
        View rootView = inflater.inflate(R.layout.view_bluetooth, this);
        setupLayoutHack();
        btnShare = rootView.findViewById(R.id.btnShare);
        btnShare.setOnClickListener(this);
    }
    // --- constructors ---
    public BluetoothShareView(Context context) {
        super(context);
        initView(context, null, 0);
    }

    public BluetoothShareView(Context context, AttributeSet attrs) {
        super(context, attrs);
        initView(context, attrs, 0);
    }

    public BluetoothShareView(Context context, AttributeSet attrs, int defStyleAttr) {
        super(context, attrs, defStyleAttr);
        initView(context, attrs, defStyleAttr);
    }
    // ------

    // --- setupLayoutHack to hack layout ---
    // it's necessary for native modules in Android for some reason.
    // e.x, without this, when adding a new line in edittext,
    // height of wrapcontent of edittext is not wrapping content.
    public void setupLayoutHack() {
        Choreographer.getInstance().postFrameCallback(new Choreographer.FrameCallback() {
            @Override
            public void doFrame(long frameTimeNanos) {
                manuallyLayoutChildren();
                getViewTreeObserver().dispatchOnGlobalLayout();
                Choreographer.getInstance().postFrameCallback(this);
            }
        });
    }

    private void manuallyLayoutChildren() {
        for (int i = 0; i < getChildCount(); i++) {
            View child = getChildAt(i);
            child.measure(MeasureSpec.makeMeasureSpec(getMeasuredWidth(), MeasureSpec.EXACTLY),
                MeasureSpec.makeMeasureSpec(getMeasuredHeight(), MeasureSpec.EXACTLY));
            child.layout(0, 0, child.getMeasuredWidth(), child.getMeasuredHeight());
        }
    }
    //endregion
}