using System.Collections.Generic;

namespace TimberwolfNetHostLib
{

    public abstract class ControllerHost
    {
        public enum EventType { Error, Input, ControllerConnected };
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

        public void AddEventListener(string eventName, EventCallback callback)
        {
            if (callbacks.ContainsKey(eventName))
            {
                List<EventCallback> newCallbacks = new List<EventCallback>(callbacks[eventName])
                {
                    callback
                };
                callbacks[eventName] = newCallbacks;
            }
            else
            {
                List<EventCallback> callbacks = new List<EventCallback>
                {
                    callback
                };
                this.callbacks.Add(eventName, callbacks);
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
