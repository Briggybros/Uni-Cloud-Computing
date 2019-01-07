import '@babel/polyfill';
import Controller, { CommsType } from './Controller';
import PeerController from './PeerController';
import RelayController from './RelayController';

export { CommsType, EventType } from './Controller';

export default async function getController(code: string): Promise<Controller> {
  const fetchIpResponse = await fetch(
    `https://cohqlf6j49.execute-api.us-east-2.amazonaws.com/prod/${code}`,
    {
      method: 'GET',
      mode: 'cors',
    }
  );
  if (!fetchIpResponse.ok) {
    throw new Error('Bad room code');
  }

  const { ip } = await fetchIpResponse.json();

  const url = `http://${ip}`;
  const fetchModeResponse = await fetch(url);
  const { mode } = await fetchModeResponse.json();

  const commsType: CommsType =
    mode === 'peer' ? CommsType.Peer : CommsType.Relay;

  switch (commsType) {
    case CommsType.Peer:
      return new PeerController(url);
    case CommsType.Relay:
      return new RelayController(url);
  }
}
