﻿using System.Collections.Generic;

namespace TimberwolfNetHostLib
{

    public abstract class ControllerHost
    {
        public static ControllerHost getControllerHost(CommsType commsType, string url, string hostKey)
        {
            switch (commsType)
            {
                case CommsType.Peer: return new PeerControllerHost(url, hostKey);
                case CommsType.Relay: return new RelayControllerHost(url, hostKey);
                default: return new RelayControllerHost(url, hostKey);
            }
        }

        public enum EventType { Error, Input, ControllerConnected, ControllerDisconnected };
        public enum CommsType { Peer, Relay };
        public readonly CommsType commsType;
        public delegate void EventCallback(params object[] parts);

        protected readonly string url;
        protected readonly string hostKey;

        private Dictionary<string, List<EventCallback>> callbacks = new Dictionary<string, List<EventCallback>>();

        public ControllerHost(string url, string hostKey, CommsType commsType)
        {
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