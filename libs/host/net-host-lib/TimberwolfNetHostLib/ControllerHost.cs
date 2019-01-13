using Newtonsoft.Json;
using SuperSocket.ClientEngine;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using WebSocket4Net;

namespace TimberwolfNetHostLib
{
    internal class RequestResponse
    {
        public int code;
        public SignallingServerResponse body;
    }

    internal class SignallingServerResponse
    {
        public string code;
        public string hostKey;
        public string ip;
    }

    public abstract class ControllerHost
    {
        public static async Task<ControllerHost> getControllerHostAsync(CommsType commsType)
        {
            TaskCompletionSource<SignallingServerResponse> promise = new TaskCompletionSource<SignallingServerResponse>();

            WebSocket socket = new WebSocket("wss://8zvz2j2xp8.execute-api.us-east-2.amazonaws.com/prod/");

            socket.Opened += new EventHandler(socket_opened);
            void socket_opened(object sender, EventArgs e)
            {
                socket.Send("{\"action\": \"requestSignallingServer\"}");
            }

            socket.Error += new EventHandler<ErrorEventArgs>(socket_error);
            void socket_error(object sender, ErrorEventArgs e)
            {
                promise.TrySetException(e.Exception);
            }

            socket.Closed += new EventHandler(socket_closed);
            void socket_closed(object sender, EventArgs e)
            {
                if (promise.Task.Status != TaskStatus.RanToCompletion)
                {
                    promise.TrySetException(new Exception("Socket closed"));
                }
            }

            socket.MessageReceived += new EventHandler<MessageReceivedEventArgs>(socket_message_received);
            void socket_message_received(object sender, MessageReceivedEventArgs e)
            {
                RequestResponse response = JsonConvert.DeserializeObject<RequestResponse>(e.Message);
                if (response.code == 201 && response.body != null)
                {
                    promise.TrySetResult(response.body);
                }
                else if (response.code >= 500 && response.code < 600)
                {
                    promise.TrySetException(new Exception("Internal Server Error"));
                }
            }

            socket.Open();

            SignallingServerResponse signallingServerResponse = await promise.Task;

            string url = "http://" + signallingServerResponse.ip;
            switch (commsType)
            {
                case CommsType.Peer: return new PeerControllerHost(signallingServerResponse.code, url, signallingServerResponse.hostKey);
                case CommsType.Relay: return new RelayControllerHost(signallingServerResponse.code, url, signallingServerResponse.hostKey);
                default: return new RelayControllerHost(signallingServerResponse.code, url, signallingServerResponse.hostKey);
            }
        }

        public enum EventType { Error, Input, ControllerConnected, ControllerDisconnected };
        public enum CommsType { Peer, Relay };
        public readonly CommsType commsType;
        public delegate void EventCallback(params object[] parts);

        public readonly string roomCode;

        protected readonly string url;
        protected readonly string hostKey;

        private Dictionary<string, List<EventCallback>> callbacks = new Dictionary<string, List<EventCallback>>();

        public ControllerHost(string roomCode, string url, string hostKey, CommsType commsType)
        {
            this.roomCode = roomCode;
            this.url = url;
            this.hostKey = hostKey;
            this.commsType = commsType;
        }

        public abstract void Connect();
        public abstract void Broadcast(params object[] args);
        public abstract void Message(string controllerId, params object[] args);

        public void AddEventListener(EventType eventType, EventCallback callback)
        {
            if (callbacks.ContainsKey(eventType.ToString()))
            {
                List<EventCallback> newCallbacks = new List<EventCallback>(callbacks[eventType.ToString()])
                {
                    callback
                };
                callbacks[eventType.ToString()] = newCallbacks;
            }
            else
            {
                List<EventCallback> callbacks = new List<EventCallback>
                {
                    callback
                };
                this.callbacks.Add(eventType.ToString(), callbacks);
            }
        }

        protected void EmitEvent(EventType eventType, params object[] parts)
        {
            if (callbacks.ContainsKey(eventType.ToString()))
            {
                foreach (EventCallback callback in callbacks[eventType.ToString()])
                {
                    callback(parts);
                }
            }
        }
    }
}
