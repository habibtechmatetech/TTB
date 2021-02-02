package com.ttb.android.p2p;

import android.os.AsyncTask;

import com.facebook.react.bridge.Callback;

import java.io.ByteArrayInputStream;
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
public class MessageClientAsyncTask extends AsyncTask<Void, Void, String> {
    private Callback callback;
    private int port;
    private String message;
    private String hostAddress;
    private static final int SOCKET_TIMEOUT = 5000;


    /**
     * @param port
     * @param callback
     */
    public MessageClientAsyncTask(int port, String hostAddress, String message, Callback callback) {
        this.callback = callback;
        this.port = port;
        this.message = message;
        this.hostAddress = hostAddress;
    }

    @Override
    protected String doInBackground(Void... params) {
        String output;
        Socket socket = new Socket();

        try {
            System.out.println("Opening client socket on port " + this.port + " - ");
            socket.bind(null);
            socket.connect((new InetSocketAddress(this.hostAddress, this.port)), SOCKET_TIMEOUT);

            System.out.println("Client socket - " + socket.isConnected());
            OutputStream stream = socket.getOutputStream();
            InputStream is = new ByteArrayInputStream(message.getBytes(Charset.forName(CHARSET)));
            copyBytes(is, stream);
            System.out.println("Client: Data written");
            output = "Client: Data written";
            this.callback.invoke();
        } catch (IOException e) {
            output = e.getMessage();
            System.err.println(e.getMessage());
            this.callback.invoke(2);
        } finally {
            if (socket != null) {
                if (socket.isConnected()) {
                    try {
                        System.out.println("Client: ALL DONE@ ");
                        socket.close();
                    } catch (IOException e) {
                        // Give up
                        e.printStackTrace();
                    }
                }
            }
        }
        return output;
    }

    /*
     * (non-Javadoc)
     * @see android.os.AsyncTask#onPreExecute()
     */
    @Override
    protected void onPreExecute() {
        System.out.println("Sending message: " + this.message);
        System.out.println("Host Address" + this.hostAddress);

    }
}
