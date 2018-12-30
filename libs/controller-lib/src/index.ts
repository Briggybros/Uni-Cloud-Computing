import '@babel/polyfill';
import Controller, { CommsType } from './Controller';
import PeerController from './PeerController';
import RelayController from './RelayController';

export { CommsType, EventType } from './Controller';

export default function getController(commsType: CommsType, url: string): Controller {
    switch (commsType) {
        case CommsType.Peer: return new PeerController(url);
        case CommsType.Relay: return new RelayController(url);
    }
}