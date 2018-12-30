import '@babel/polyfill';

import ControllerHost, { CommsType } from "./ControllerHost";
import PeerControllerHost from "./PeerControllerHost";
import RelayControllerHost from "./RelayControllerHost";

export { CommsType } from './ControllerHost';

export default function getControllerHost(commsType: CommsType, url: string, hostKey: string): ControllerHost {
    switch (commsType) {
        case CommsType.Peer: return new PeerControllerHost(url, hostKey);
        case CommsType.Relay: return new RelayControllerHost(url, hostKey);
        default: return new RelayControllerHost(url, hostKey);
    }
}