package com.ttb.android.utils;

import android.app.Dialog;
import android.content.Context;
import android.text.TextUtils;
import android.view.View;
import android.view.Window;
import android.widget.Button;
import android.widget.TextView;

import com.ttb.android.R;

public class UIUtils {
    public static void showWaring(Context context, String title, String message, View.OnClickListener clickListener) {
        final Dialog dialog = new Dialog(context);
        dialog.requestWindowFeature(Window.FEATURE_NO_TITLE);
        dialog.setCancelable(false);
        dialog.setContentView(R.layout.dlg_warning);

        TextView txtTitle = (TextView) dialog.findViewById(R.id.txtTitle);
        if (TextUtils.isEmpty(title)) {
            txtTitle.setVisibility(View.GONE);
        } else  {
            txtTitle.setText(title);
        }

        TextView txtMessage = (TextView) dialog.findViewById(R.id.txtMessage);
        if (TextUtils.isEmpty(message)) {
            txtMessage.setVisibility(View.GONE);
        } else  {
            txtMessage.setText(message);
        }

        Button okButton = (Button) dialog.findViewById(R.id.btnOK);
        okButton.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                dialog.dismiss();
                if (clickListener != null) {
                    clickListener.onClick(v);
                }
            }
        });

        dialog.show();
    }
}
