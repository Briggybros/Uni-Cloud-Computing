import '@babel/polyfill';
import Controller, { CommsType } from './Controller';
import PeerController from './PeerController';
import RelayController from './RelayController';

export { CommsType, EventType } from './Controller';

export default async function getController(url: string): Promise<Controller> {
  const response = await fetch(`${url}`);
  const info = await response.json();

  const commsType: CommsType =
    info.mode === 'peer' ? CommsType.Peer : CommsType.Relay;

  switch (commsType) {
    case CommsType.Peer:
      return new PeerController(url);
    case CommsType.Relay:
      return new RelayController(url);
  }
}
