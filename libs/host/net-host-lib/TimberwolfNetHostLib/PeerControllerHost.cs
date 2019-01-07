using System;

namespace TimberwolfNetHostLib
{
    internal class PeerControllerHost : ControllerHost
    {
<<<<<<< HEAD
        public PeerControllerHost(string roomCode, string url, string hostKey) : base(roomCode, url, hostKey, CommsType.Peer)
=======
        public PeerControllerHost(string url, string hostKey) : base(url, hostKey, CommsType.Peer)
>>>>>>> master
        {
            throw new NotImplementedException();
        }

        public override void Connect()
        {
            throw new NotImplementedException();
        }

        public override void Broadcast(params object[] args)
        {
            throw new NotImplementedException();
        }

        public override void Message(string controllerId, params object[] args)
        {
            throw new NotImplementedException();
        }
    }
}
