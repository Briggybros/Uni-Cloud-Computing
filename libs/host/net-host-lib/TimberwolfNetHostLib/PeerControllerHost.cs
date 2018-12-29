using System;

namespace TimberwolfNetHostLib
{
    internal class PeerControllerHost : ControllerHost
    {
        public PeerControllerHost(string url, string hostKey) : base(url, hostKey, CommsType.Peer)
        {
            throw new NotImplementedException();
        }

        public override void Connect()
        {
            throw new NotImplementedException();
        }
    }
}
