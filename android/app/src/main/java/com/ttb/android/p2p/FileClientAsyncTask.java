package com.ttb.android.p2p;

import android.content.ContentResolver;
import android.content.Context;
import android.net.Uri;
import android.os.AsyncTask;
import android.util.Log;

import com.facebook.react.bridge.Callback;
import com.koushikdutta.async.ByteBufferList;
import com.koushikdutta.async.DataEmitter;
import com.koushikdutta.async.callback.DataCallback;
import com.koushikdutta.async.http.WebSocket;

import java.io.ByteArrayInputStream;
import java.io.FileNotFoundException;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.Socket;
import java.nio.charset.Charset;

import static com.ttb.android.p2p.Utils.CHARSET;
import static com.ttb.android.p2p.Utils.copyBytes;

/**
 * Created by kiryl on 18.7.18.
 * A simple server socket that accepts connection and writes some data on
 * the stream.
 */
public class FileClientAsyncTask extends AsyncTask<Void, Void, String> {
    private Context context;
    private Callback callback;
    private String fileUri;
    private WebSocket socket;


    public FileClientAsyncTask(Context context, WebSocket socket, String fileUri, Callback callback) {
        this.context = context;
        this.callback = callback;
        this.fileUri = fileUri;
        this.socket = socket;
    }

    @Override
    protected String doInBackground(Void... params) {
        Log.d("FileServerAsync", "Starting Send File");
        ContentResolver cr =  context.getContentResolver();
        InputStream is = null;
        try {
            is = cr.openInputStream(Uri.parse(fileUri));
        } catch (FileNotFoundException e) {
            System.err.println(e.getMessage());
        }

        byte buf[] = new byte[1024];
        int len;
        try {
            while ((len = is.read(buf)) != -1) {
                socket.send(buf, 0, len);
            }
            socket.send("CLOSE_FILE");
            is.close();
        } catch (IOException e) {
            System.err.println(e.getMessage());
            callback.invoke(-1);
            return "e.getMessage()";
        }
        callback.invoke();
        return "Success";

    }

    /*
     * (non-Javadoc)
     * @see android.os.AsyncTask#onPreExecute()
     */
    @Override
    protected void onPreExecute() {
        System.out.println("Sending file: " + this.fileUri);

    }
}
