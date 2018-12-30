using Quobject.EngineIoClientDotNet.ComponentEmitter;
using Quobject.SocketIoClientDotNet.Client;
using System;

namespace TimberwolfNetHostLib
{
    public class RelayControllerHost : ControllerHost
    {
        private Socket socket;

        public RelayControllerHost(string url, string hostKey) : base(url, hostKey, CommsType.Relay)
        {
        }

        public override void Connect()
        {
            socket = IO.Socket(url);

            socket.On(Socket.EVENT_CONNECT_ERROR, (error) =>
            {
                EmitEvent(EventType.Error, error);
            });

            socket.On(Socket.EVENT_CONNECT_TIMEOUT, (error) =>
            {
                EmitEvent(EventType.Error, error);
            });

            socket.On("signalling_error", new SignallingErrorListener(EmitEvent));

            socket.On(Socket.EVENT_CONNECT, () =>
            {
                socket.Emit("register-host", "relay", hostKey);
            });

            socket.On("controller-input", new ControllerInputListener(EmitEvent));
            socket.On("controller-description", new ControllerDescriptionListener(EmitEvent));
            socket.On("controller-disconnected", new ControllerDisconnectedListener(EmitEvent));
        }

        public override void Broadcast(params object[] args)
        {
            socket.Emit("broadcast", args);
        }

        public override void Message(string controllerId, params object[] args)
        {
            socket.Emit("broadcast", args);
        }

        private class ControllerInputListener : IListener
        {
            private readonly Action<EventType, object[]> emitEvent;

            public ControllerInputListener(Action<EventType, object[]> emitEvent)
            {
                this.emitEvent = emitEvent;
            }

            public void Call(params object[] args)
            {
                emitEvent(EventType.Input, args);
            }

            public int CompareTo(IListener other)
            {
                throw new System.NotImplementedException();
            }

            public int GetId()
            {
                throw new System.NotImplementedException();
            }
        }

        private class ControllerDescriptionListener : IListener
        {
            private readonly Action<EventType, object[]> emitEvent;

            public ControllerDescriptionListener(Action<EventType, object[]> emitEvent)
            {
                this.emitEvent = emitEvent;
            }

            public void Call(params object[] args)
            {
                emitEvent(EventType.ControllerConnected, args);
            }

            public int CompareTo(IListener other)
            {
                throw new System.NotImplementedException();
            }

            public int GetId()
            {
                throw new System.NotImplementedException();
            }
        }

        private class SignallingErrorListener : IListener
        {
            private readonly Action<EventType, object[]> emitEvent;

            public SignallingErrorListener(Action<EventType, object[]> emitEvent)
            {
                this.emitEvent = emitEvent;
            }

            public void Call(params object[] args)
            {
                emitEvent(EventType.Error, args);
            }

            public int CompareTo(IListener other)
            {
                throw new NotImplementedException();
            }

            public int GetId()
            {
                throw new NotImplementedException();
            }
        }

        private class ControllerDisconnectedListener : IListener
        {
            private readonly Action<EventType, object[]> emitEvent;

            public ControllerDisconnectedListener(Action<EventType, object[]> emitEvent)
            {
                this.emitEvent = emitEvent;
            }

            public void Call(params object[] args)
            {
                emitEvent(EventType.ControllerDisconnected, args);
            }

            public int CompareTo(IListener other)
            {
                throw new NotImplementedException();
            }

            public int GetId()
            {
                throw new NotImplementedException();
            }
        }
    }
}
